package com.kwan.service;

import com.kwan.dto.ItineraryRequest;
import com.kwan.model.Listing;
import com.kwan.repository.ListingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RagService {

    private static final Logger log = LoggerFactory.getLogger(RagService.class);

    private final ListingRepository listingRepository;
    private final EmbeddingService embeddingService;

    @Value("${gemini.rag.top-k:8}")
    private int topK;

    public RagService(ListingRepository listingRepository, EmbeddingService embeddingService) {
        this.listingRepository = listingRepository;
        this.embeddingService = embeddingService;
    }

    public List<Listing> retrieveRelevantListings(ItineraryRequest request) {
        try {
            String queryText = buildQueryString(request);
            log.info("RAG query: '{}'", queryText);

            float[] queryEmbedding = embeddingService.embed(queryText);
            String vectorStr = embeddingService.toVectorString(queryEmbedding);

            String country = request.getCountry() != null ? request.getCountry() : "GH";
            String city = request.getDestination() != null ? request.getDestination() : "Accra";

            List<Listing> results = listingRepository.findSimilarListings(
                    vectorStr, country, city, topK
            );

            if (results.isEmpty()) {
                log.warn("No specific city listings found for {}, falling back to country listings", city);
                results = listingRepository.findByCountryAndIsActiveTrue(country);
            }

            log.info("RAG retrieved {} listings for destination: {}", results.size(), city);
            return results;

        } catch (Exception e) {
            log.error("RAG retrieval failed, falling back to country listings: {}", e.getMessage());
            return listingRepository.findByCountryAndIsActiveTrue(request.getCountry() != null ? request.getCountry() : "GH");
        }
    }

    public String buildContext(List<Listing> listings) {
        if (listings.isEmpty()) {
            return "No local listings found in the database for this destination.";
        }

        StringBuilder sb = new StringBuilder();
        sb.append("=== LOCAL OPERATOR INVENTORY (Use ONLY these listings in the itinerary) ===\n\n");

        for (int i = 0; i < listings.size(); i++) {
            Listing l = listings.get(i);
            sb.append(String.format("LISTING %d:\n", i + 1));
            sb.append(String.format("  ID: %s\n", l.getId()));
            sb.append(String.format("  Title: %s\n", l.getTitle()));
            sb.append(String.format("  Category: %s\n", l.getCategory()));
            sb.append(String.format("  Operator: %s\n", l.getOperator() != null ? l.getOperator().getBusinessName() : "Local Vendor"));
            sb.append(String.format("  Operator ID: %s\n", l.getOperator() != null ? l.getOperator().getId() : "N/A"));
            sb.append(String.format("  Description: %s\n", l.getDescription()));
            sb.append(String.format("  Price: %s %s\n", l.getPriceAmount(), l.getPriceCurrency()));
            sb.append(String.format("  Location: %s, %s\n", l.getCity(), l.getCountry()));

            if (l.getLocationDetails() != null) {
                sb.append(String.format("  Location Details: %s\n", l.getLocationDetails()));
            }
            if (l.getWhatsappBookingLink() != null) {
                sb.append(String.format("  WhatsApp: %s\n", l.getWhatsappBookingLink()));
            }
            sb.append("\n");
        }

        return sb.toString();
    }

    private String buildQueryString(ItineraryRequest request) {
        StringBuilder sb = new StringBuilder();
        sb.append(request.getDestination() != null ? request.getDestination() : "Accra").append(" ");
        sb.append(request.getCountry() != null ? request.getCountry() : "GH").append(" ");
        if (request.getInterests() != null && !request.getInterests().isEmpty()) {
            sb.append(String.join(" ", request.getInterests())).append(" ");
        }
        if (request.isIncludeInformalTransport()) sb.append("trotro matatu transit ");
        if (request.isIncludeLocalMarkets()) sb.append("market street vendor ");
        if (request.isIncludeHomestays()) sb.append("homestay guesthouse ");
        return sb.toString().trim();
    }
}
