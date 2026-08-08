package com.kwan.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kwan.dto.ItineraryRequest;
import com.kwan.dto.ItineraryResponse;
import com.kwan.model.Itinerary;
import com.kwan.model.Listing;
import com.kwan.repository.ItineraryRepository;
import okhttp3.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class ItineraryService {

    private static final Logger log = LoggerFactory.getLogger(ItineraryService.class);

    private final RagService ragService;
    private final ItineraryRepository itineraryRepository;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.api.base-url}")
    private String geminiBaseUrl;

    @Value("${gemini.api.generation-model}")
    private String generationModel;

    private final OkHttpClient httpClient = new OkHttpClient.Builder()
            .callTimeout(java.time.Duration.ofSeconds(120))
            .build();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final MediaType JSON = MediaType.get("application/json; charset=utf-8");

    public ItineraryService(RagService ragService, ItineraryRepository itineraryRepository) {
        this.ragService = ragService;
        this.itineraryRepository = itineraryRepository;
    }

    public ItineraryResponse generateItinerary(ItineraryRequest request) throws IOException {
        log.info("Generating itinerary for {} days in {}", request.getTotalDays(), request.getDestination());

        List<Listing> relevantListings = ragService.retrieveRelevantListings(request);
        String listingContext = ragService.buildContext(relevantListings);

        String systemPrompt = buildSystemPrompt(request, listingContext);
        String userMessage = "Generate a complete hyper-local itinerary for " + request.getDestination();

        String rawResponse = callGemini(systemPrompt, userMessage);
        log.debug("Raw Gemini response length: {} chars", rawResponse.length());

        ItineraryResponse response = parseGeminiResponse(rawResponse, request);

        saveItinerary(request, response, rawResponse);

        return response;
    }

    private String buildSystemPrompt(ItineraryRequest request, String listingContext) {
        return """
            You are Kwan AI — an expert hyper-local African travel concierge.
            Your specialty is creating authentic travel itineraries using ONLY grassroots African operators — NOT Western hotel chains or Expedia.

            CRITICAL RULES:
            1. ONLY use listings from the LOCAL OPERATOR INVENTORY provided below. Do NOT invent operators.
            2. For transport, describe LOCAL options: trotros (Ghana), matatus (Kenya), boda bodas (Uganda/Rwanda/Kenya), okadas (Nigeria). Include typical fares.
            3. For markets, include specific stalls, what to buy, how to bargain, and safety tips.
            4. Include at least one community tip per day — insider knowledge locals would share.
            5. Include a useful local phrase in the relevant dialect for each day (Twi for Ghana, Swahili for East Africa, etc.) under 'dialectPhrase'.
            6. Return your response as a structured JSON object matching the schema below EXACTLY.
            7. Total estimated cost must not exceed $%s USD.

            PREFERRED LANGUAGE: %s

            %s

            RESPONSE JSON SCHEMA:
            {
              "destination": "%s",
              "country": "%s",
              "totalDays": %d,
              "estimatedTotalCostUsd": 450,
              "pace": "%s",
              "languageNote": "Local language tip...",
              "travelTips": ["tip1", "tip2"],
              "transportSummary": {
                "gettingAroundTip": "...",
                "options": [{"type": "Trotro", "description": "...", "typicalFare": "GHS 5", "tip": "..."}]
              },
              "days": [
                {
                  "dayNumber": 1,
                  "date": "2026-09-01",
                  "theme": "Day Theme",
                  "aiNarrative": "...",
                  "estimatedDayCostUsd": 100,
                  "activities": [
                    {
                      "timeSlot": "Morning",
                      "title": "Activity Title",
                      "description": "...",
                      "category": "DAY_TOUR",
                      "operatorName": "Operator Name",
                      "operatorId": "uuid",
                      "listingId": "uuid",
                      "priceLocal": 120,
                      "localCurrency": "GHS",
                      "priceUsd": 15,
                      "location": "Location",
                      "whatsappContact": "+233...",
                      "bookingType": "ONLINE",
                      "isBookable": true,
                      "localTips": ["tip1"],
                      "dialectPhrase": "Akwaaba - Welcome"
                    }
                  ]
                }
              ]
            }
            """.formatted(
                request.getBudgetUsd(),
                request.getPreferredLanguage(),
                listingContext,
                request.getDestination(),
                request.getCountry(),
                request.getTotalDays(),
                request.getPace()
        );
    }

    private String callGemini(String systemPrompt, String userMessage) throws IOException {
        String url = geminiBaseUrl + "/models/" + generationModel + ":generateContent?key=" + geminiApiKey;

        var body = java.util.Map.of(
                "system_instruction", java.util.Map.of("parts", List.of(java.util.Map.of("text", systemPrompt))),
                "contents", List.of(java.util.Map.of("role", "user", "parts", List.of(java.util.Map.of("text", userMessage)))),
                "generationConfig", java.util.Map.of(
                        "responseMimeType", "application/json",
                        "temperature", 0.7,
                        "maxOutputTokens", 8192
                )
        );

        Request req = new Request.Builder()
                .url(url)
                .post(RequestBody.create(objectMapper.writeValueAsString(body), JSON))
                .build();

        try (Response response = httpClient.newCall(req).execute()) {
            String respStr = response.body().string();
            if (!response.isSuccessful()) {
                throw new IOException("Gemini API call failed: " + response.code() + " " + respStr);
            }
            JsonNode root = objectMapper.readTree(respStr);
            return root.path("candidates").get(0)
                    .path("content").path("parts").get(0)
                    .path("text").asText();
        }
    }

    private ItineraryResponse parseGeminiResponse(String json, ItineraryRequest request) {
        try {
            JsonNode root = objectMapper.readTree(json);

            List<ItineraryResponse.DayPlan> days = new ArrayList<>();
            JsonNode daysNode = root.path("days");
            if (daysNode.isArray()) {
                for (JsonNode dNode : daysNode) {
                    List<ItineraryResponse.Activity> activities = new ArrayList<>();
                    JsonNode actNode = dNode.path("activities");
                    if (actNode.isArray()) {
                        for (JsonNode a : actNode) {
                            activities.add(ItineraryResponse.Activity.builder()
                                    .timeSlot(a.path("timeSlot").asText("Morning"))
                                    .title(a.path("title").asText(""))
                                    .description(a.path("description").asText(""))
                                    .category(a.path("category").asText("DAY_TOUR"))
                                    .operatorName(a.path("operatorName").asText(""))
                                    .operatorId(a.path("operatorId").asText(null))
                                    .listingId(a.path("listingId").asText(null))
                                    .priceLocal(BigDecimal.valueOf(a.path("priceLocal").asDouble(0)))
                                    .localCurrency(a.path("localCurrency").asText("GHS"))
                                    .priceUsd(BigDecimal.valueOf(a.path("priceUsd").asDouble(0)))
                                    .location(a.path("location").asText(""))
                                    .whatsappContact(a.path("whatsappContact").asText(null))
                                    .bookingType(a.path("bookingType").asText("ONLINE"))
                                    .isBookable(a.path("isBookable").asBoolean(false))
                                    .localTips(extractStringList(a.path("localTips")))
                                    .dialectPhrase(a.path("dialectPhrase").asText(null))
                                    .build());
                        }
                    }

                    days.add(ItineraryResponse.DayPlan.builder()
                            .dayNumber(dNode.path("dayNumber").asInt(1))
                            .date(dNode.path("date").asText(""))
                            .theme(dNode.path("theme").asText(""))
                            .aiNarrative(dNode.path("aiNarrative").asText(""))
                            .estimatedDayCostUsd(BigDecimal.valueOf(dNode.path("estimatedDayCostUsd").asDouble(0)))
                            .activities(activities)
                            .build());
                }
            }

            JsonNode transportNode = root.path("transportSummary");
            List<ItineraryResponse.TransportOption> transportOptions = new ArrayList<>();
            JsonNode optionsNode = transportNode.path("options");
            if (optionsNode.isArray()) {
                for (JsonNode optNode : optionsNode) {
                    transportOptions.add(ItineraryResponse.TransportOption.builder()
                            .type(optNode.path("type").asText(""))
                            .description(optNode.path("description").asText(""))
                            .typicalFare(optNode.path("typicalFare").asText(""))
                            .tip(optNode.path("tip").asText(""))
                            .build());
                }
            }

            ItineraryResponse.TransportSummary transportSummary = ItineraryResponse.TransportSummary.builder()
                    .gettingAroundTip(transportNode.path("gettingAroundTip").asText(""))
                    .options(transportOptions)
                    .build();

            return ItineraryResponse.builder()
                    .destination(request.getDestination())
                    .country(request.getCountry())
                    .totalDays(request.getTotalDays())
                    .pace(request.getPace())
                    .estimatedTotalCostUsd(BigDecimal.valueOf(root.path("estimatedTotalCostUsd").asDouble(0)))
                    .days(days)
                    .travelTips(extractStringList(root.path("travelTips")))
                    .transportSummary(transportSummary)
                    .languageNote(root.path("languageNote").asText(null))
                    .build();

        } catch (Exception e) {
            log.error("Failed to parse Gemini response: {}", e.getMessage());
            throw new RuntimeException("Failed to parse AI response: " + e.getMessage(), e);
        }
    }

    private void saveItinerary(ItineraryRequest request, ItineraryResponse response, String rawJson) {
        try {
            Itinerary itinerary = Itinerary.builder()
                    .destination(request.getDestination())
                    .country(request.getCountry())
                    .totalDays(request.getTotalDays())
                    .generatedJson(rawJson)
                    .pace(request.getPace())
                    .estimatedTotalCostUsd(response.getEstimatedTotalCostUsd() != null ? response.getEstimatedTotalCostUsd().doubleValue() : 0.0)
                    .preferredLanguage(request.getPreferredLanguage())
                    .build();

            Itinerary saved = itineraryRepository.save(itinerary);
            response.setItineraryId(saved.getId());
            log.info("Itinerary saved with ID: {}", saved.getId());
        } catch (Exception e) {
            log.warn("Failed to save itinerary to DB: {}", e.getMessage());
        }
    }

    private List<String> extractStringList(JsonNode node) {
        List<String> list = new ArrayList<>();
        if (node.isArray()) {
            node.forEach(n -> list.add(n.asText()));
        }
        return list;
    }
}
