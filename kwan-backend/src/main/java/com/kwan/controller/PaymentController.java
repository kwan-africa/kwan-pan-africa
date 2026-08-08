package com.kwan.controller;

import com.kwan.dto.PaymentRequest;
import com.kwan.service.PaymentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/initialize")
    public ResponseEntity<?> initialize(@RequestBody PaymentRequest req) {
        try {
            log.info("Initializing payment for listing: {}", req.getListingId());
            Map<String, Object> result = paymentService.initializePayment(
                    UUID.fromString(req.getListingId()),
                    req.getTouristEmail(),
                    req.getTouristName(),
                    req.getAmountUsd(),
                    req.getSpecialRequests(),
                    req.getGroupSize()
            );
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Failed to initialize payment: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verify(@RequestParam String reference) {
        try {
            log.info("Verifying payment reference: {}", reference);
            Map<String, Object> result = paymentService.verifyAndSettle(reference);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Failed to verify payment: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
