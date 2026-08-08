package com.kwan.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> home() {
        Map<String, Object> info = new LinkedHashMap<>();
        info.put("app", "Kwan AI");
        info.put("tagline", "The Path Through Africa's Real Economy");
        info.put("version", "1.0.0");
        info.put("status", "running");
        info.put("endpoints", Map.of(
            "operators", "/api/operators",
            "generateItinerary", "POST /api/itinerary/generate",
            "ingestCity", "POST /api/admin/ingest?city=Accra&country=GH",
            "initPayment", "POST /api/payments/initialize",
            "health", "/actuator/health"
        ));
        return ResponseEntity.ok(info);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "kwan-backend"));
    }
}
