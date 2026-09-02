package com.kwan.controller;

import com.kwan.dto.ItineraryRequest;
import com.kwan.dto.ItineraryResponse;
import com.kwan.service.ItineraryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.io.IOException;
import java.io.UncheckedIOException;

/**
 * REST endpoint for AI-powered itinerary generation.
 *
 * <p>Validation is handled by {@code @Valid} + {@code GlobalExceptionHandler}.
 * Checked {@code IOException} from the service layer is wrapped as
 * {@code UncheckedIOException} so that {@code GlobalExceptionHandler} can
 * intercept it without each controller method needing its own try/catch.
 */
@RestController
@RequestMapping("/api/itinerary")
@Validated
public class ItineraryController {

    private static final Logger log = LoggerFactory.getLogger(ItineraryController.class);

    private final ItineraryService itineraryService;

    public ItineraryController(ItineraryService itineraryService) {
        this.itineraryService = itineraryService;
    }

    @PostMapping("/generate")
    public ResponseEntity<ItineraryResponse> generate(@Valid @RequestBody ItineraryRequest request) {
        log.info("Itinerary generation request for {}, {}", request.getDestination(), request.getCountry());
        try {
            ItineraryResponse result = itineraryService.generateItinerary(request);
            return ResponseEntity.ok(result);
        } catch (IOException e) {
            // Rethrow as unchecked so GlobalExceptionHandler can catch it cleanly.
            // The handler will log the full stack trace and return a structured 500.
            throw new UncheckedIOException("Failed to call AI service", e);
        }
    }
}
