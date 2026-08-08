package com.kwan.controller;

import com.kwan.service.LiveDataIngestionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private static final Logger log = LoggerFactory.getLogger(AdminController.class);

    private final LiveDataIngestionService ingestionService;

    public AdminController(LiveDataIngestionService ingestionService) {
        this.ingestionService = ingestionService;
    }

    @PostMapping("/ingest")
    public ResponseEntity<?> ingestCity(
            @RequestParam String city,
            @RequestParam String country) {
        try {
            log.info("Admin triggered ingestion for {} ({})", city, country);
            int added = ingestionService.ingestCity(city, country);
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "city", city,
                    "country", country,
                    "listingsAdded", added,
                    "message", String.format(
                            "Ingested %d live listings from Google Places for %s. Kwan AI is now indexing them.",
                            added, city)
            ));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Configuration missing",
                    "message", "Add GOOGLE_PLACES_API_KEY to your .env file"
            ));
        } catch (Exception e) {
            log.error("Ingestion failed for {}: {}", city, e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Ingestion failed",
                    "message", e.getMessage()
            ));
        }
    }
}
