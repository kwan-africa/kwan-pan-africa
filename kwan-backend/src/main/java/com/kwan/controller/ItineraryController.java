package com.kwan.controller;

import com.kwan.dto.ItineraryRequest;
import com.kwan.dto.ItineraryResponse;
import com.kwan.service.ItineraryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/itinerary")
public class ItineraryController {

    private static final Logger log = LoggerFactory.getLogger(ItineraryController.class);

    private final ItineraryService itineraryService;

    public ItineraryController(ItineraryService itineraryService) {
        this.itineraryService = itineraryService;
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generate(@RequestBody ItineraryRequest request) {
        try {
            log.info("Received itinerary generation request for {}", request.getDestination());
            ItineraryResponse result = itineraryService.generateItinerary(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Failed to generate itinerary: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
