package com.kwan.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kwan.model.Listing;
import com.kwan.model.Operator;
import com.kwan.repository.ListingRepository;
import com.kwan.repository.OperatorRepository;
import okhttp3.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.*;

@Service
public class LiveDataIngestionService {

    private static final Logger log = LoggerFactory.getLogger(LiveDataIngestionService.class);

    private final OperatorRepository operatorRepository;
    private final ListingRepository listingRepository;
    private final EmbeddingService embeddingService;

    @Value("${google.places.api-key:}")
    private String googlePlacesApiKey;

    private final OkHttpClient httpClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final Map<String, double[]> CITY_COORDS = Map.of(
        "Accra",   new double[]{5.6037, -0.1870},
        "Lagos",   new double[]{6.5244, 3.3792},
        "Nairobi", new double[]{-1.2921, 36.8219},
        "Kigali",  new double[]{-1.9441, 30.0619},
        "Dakar",   new double[]{14.7167, -17.4677},
        "Kumasi",  new double[]{6.6885, -1.6244},
        "Abuja",   new double[]{9.0579, 7.4951}
    );

    private static final Map<String, Listing.ListingCategory> PLACE_TYPE_MAP = Map.of(
        "tourist_attraction", Listing.ListingCategory.DAY_TOUR,
        "museum",             Listing.ListingCategory.CULTURAL_EXPERIENCE,
        "lodging",            Listing.ListingCategory.ACCOMMODATION,
        "restaurant",         Listing.ListingCategory.FOOD_EXPERIENCE,
        "market",             Listing.ListingCategory.CULTURAL_EXPERIENCE,
        "campground",         Listing.ListingCategory.ACCOMMODATION
    );

    public LiveDataIngestionService(OperatorRepository operatorRepository, ListingRepository listingRepository, EmbeddingService embeddingService, OkHttpClient httpClient) {
        this.operatorRepository = operatorRepository;
        this.listingRepository = listingRepository;
        this.embeddingService = embeddingService;
        this.httpClient = httpClient;
    }

    public int ingestCity(String city, String country) throws IOException {
        if (googlePlacesApiKey == null || googlePlacesApiKey.isBlank()) {
            throw new IllegalStateException("GOOGLE_PLACES_API_KEY not configured");
        }

        double[] coords = CITY_COORDS.getOrDefault(city, new double[]{5.6037, -0.1870});
        int totalAdded = 0;

        String[] searchKeywords = {
            "local tour guide " + city,
            "cultural experience " + city,
            "guesthouse " + city,
            "local restaurant " + city,
            "market " + city,
            "eco lodge " + city
        };

        for (String keyword : searchKeywords) {
            List<Map<String, Object>> places = searchPlaces(keyword, coords);
            for (Map<String, Object> place : places) {
                try {
                    if (ingestPlace(place, city, country)) {
                        totalAdded++;
                    }
                } catch (Exception e) {
                    log.warn("Skipped place '{}': {}", place.get("name"), e.getMessage());
                }
            }
        }

        log.info("Ingested {} live listings for {} ({})", totalAdded, city, country);
        return totalAdded;
    }

    private List<Map<String, Object>> searchPlaces(String keyword, double[] coords) throws IOException {
        String url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json" +
            "?location=" + coords[0] + "," + coords[1] +
            "&radius=15000" +
            "&keyword=" + keyword.replace(" ", "%20") +
            "&key=" + googlePlacesApiKey;

        Request request = new Request.Builder().url(url).get().build();
        try (Response response = httpClient.newCall(request).execute()) {
            String body = response.body().string();
            JsonNode root = objectMapper.readTree(body);
            List<Map<String, Object>> results = new ArrayList<>();
            for (JsonNode r : root.path("results")) {
                Map<String, Object> place = new LinkedHashMap<>();
                place.put("placeId", r.path("place_id").asText());
                place.put("name", r.path("name").asText());
                place.put("address", r.path("vicinity").asText());
                place.put("rating", r.path("rating").asDouble(0));
                place.put("types", r.path("types"));
                place.put("lat", r.path("geometry").path("location").path("lat").asDouble());
                place.put("lng", r.path("geometry").path("location").path("lng").asDouble());
                if (!r.path("photos").isEmpty()) {
                    String photoRef = r.path("photos").get(0).path("photo_reference").asText();
                    place.put("photoUrl", getPhotoUrl(photoRef));
                }
                results.add(place);
            }
            return results;
        }
    }

    private boolean ingestPlace(Map<String, Object> place, String city, String country) throws Exception {
        String placeId = (String) place.get("placeId");
        String name = (String) place.get("name");

        if (listingRepository.findByInstagramHandle(placeId).isPresent()) {
            return false;
        }

        JsonNode types = (JsonNode) place.get("types");
        Listing.ListingCategory category = Listing.ListingCategory.DAY_TOUR;
        for (Map.Entry<String, Listing.ListingCategory> entry : PLACE_TYPE_MAP.entrySet()) {
            for (JsonNode t : types) {
                if (t.asText().equals(entry.getKey())) {
                    category = entry.getValue();
                    break;
                }
            }
        }

        Map<String, String> details = getPlaceDetails(placeId);

        Operator cityOperator = operatorRepository
            .findByEmail("places-" + city.toLowerCase() + "@kwan.ai")
            .orElseGet(() -> operatorRepository.save(Operator.builder()
                .businessName("Kwan Verified — " + city)
                .email("places-" + city.toLowerCase() + "@kwan.ai")
                .country(country).city(city)
                .whatsappNumber(details.getOrDefault("phone", ""))
                .description("Verified local businesses in " + city + " indexed by Kwan AI.")
                .isActive(true).isVerified(true)
                .build()));

        String description = buildDescription(name, city, details, (double) place.get("rating"), category);
        BigDecimal price = estimatePrice(category, country);
        String currency = getCurrency(country);

        Listing listing = Listing.builder()
            .operator(cityOperator)
            .title(name)
            .description(description)
            .category(category)
            .priceAmount(price)
            .priceCurrency(currency)
            .country(country)
            .city(city)
            .locationDetails((String) place.get("address"))
            .instagramHandle(placeId)
            .imageUrls(place.containsKey("photoUrl") ? new String[]{(String) place.get("photoUrl")} : null)
            .tags(inferTags(category, city))
            .isActive(true)
            .build();

        String textToEmbed = String.format("%s %s %s %s", name, description, city, category.name());
        float[] embedding = embeddingService.embed(textToEmbed);
        listing.setEmbedding(embedding);

        listingRepository.save(listing);
        log.info("  ✓ Ingested: {} ({})", name, category);
        return true;
    }

    private Map<String, String> getPlaceDetails(String placeId) {
        try {
            String url = "https://maps.googleapis.com/maps/api/place/details/json" +
                "?place_id=" + placeId +
                "&fields=formatted_phone_number,website,editorial_summary" +
                "&key=" + googlePlacesApiKey;
            Request request = new Request.Builder().url(url).get().build();
            try (Response response = httpClient.newCall(request).execute()) {
                JsonNode root = objectMapper.readTree(response.body().string());
                JsonNode result = root.path("result");
                Map<String, String> details = new LinkedHashMap<>();
                details.put("phone", result.path("formatted_phone_number").asText(""));
                details.put("website", result.path("website").asText(""));
                details.put("summary", result.path("editorial_summary").path("overview").asText(""));
                return details;
            }
        } catch (Exception e) {
            return Map.of();
        }
    }

    private String getPhotoUrl(String photoRef) {
        return "https://maps.googleapis.com/maps/api/place/photo" +
            "?maxwidth=800&photo_reference=" + photoRef + "&key=" + googlePlacesApiKey;
    }

    private String buildDescription(String name, String city, Map<String, String> details,
                                     double rating, Listing.ListingCategory category) {
        StringBuilder sb = new StringBuilder();
        String summary = details.getOrDefault("summary", "");
        if (!summary.isEmpty()) {
            sb.append(summary).append(" ");
        } else {
            sb.append(String.format("A local %s experience in %s. ",
                category.name().toLowerCase().replace("_", " "), city));
        }
        if (rating > 0) {
            sb.append(String.format("Rated %.1f/5 by visitors. ", rating));
        }
        sb.append(String.format("Verified and indexed by Kwan AI for authentic %s travel.", city));
        return sb.toString();
    }

    private BigDecimal estimatePrice(Listing.ListingCategory category, String country) {
        return switch (category) {
            case ACCOMMODATION -> country.equals("GH") ? BigDecimal.valueOf(350) : BigDecimal.valueOf(3500);
            case DAY_TOUR, CULTURAL_EXPERIENCE -> country.equals("GH") ? BigDecimal.valueOf(150) : BigDecimal.valueOf(2000);
            case FOOD_EXPERIENCE -> country.equals("GH") ? BigDecimal.valueOf(80) : BigDecimal.valueOf(1200);
            default -> BigDecimal.valueOf(100);
        };
    }

    private String getCurrency(String country) {
        return switch (country) {
            case "KE" -> "KES";
            case "RW" -> "RWF";
            case "NG" -> "NGN";
            case "SN" -> "XOF";
            default -> "GHS";
        };
    }

    private String[] inferTags(Listing.ListingCategory category, String city) {
        List<String> tags = new ArrayList<>(List.of("kwan-verified", city.toLowerCase()));
        tags.addAll(switch (category) {
            case DAY_TOUR -> List.of("tour", "local guide", "authentic");
            case ACCOMMODATION -> List.of("stay", "guesthouse", "local");
            case FOOD_EXPERIENCE -> List.of("food", "local cuisine", "street food");
            case CULTURAL_EXPERIENCE -> List.of("culture", "heritage", "community");
            default -> List.of("experience");
        });
        return tags.toArray(new String[0]);
    }
}
