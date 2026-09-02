package com.kwan.controller;

import com.kwan.model.Booking;
import com.kwan.model.Listing;
import com.kwan.model.Operator;
import com.kwan.repository.BookingRepository;
import com.kwan.repository.ListingRepository;
import com.kwan.repository.OperatorRepository;
import com.kwan.service.EmbeddingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/operators")
public class OperatorController {

    private static final Logger log = LoggerFactory.getLogger(OperatorController.class);

    private final OperatorRepository operatorRepository;
    private final ListingRepository listingRepository;
    private final BookingRepository bookingRepository;
    private final EmbeddingService embeddingService;

    public OperatorController(OperatorRepository operatorRepository, ListingRepository listingRepository, BookingRepository bookingRepository, EmbeddingService embeddingService) {
        this.operatorRepository = operatorRepository;
        this.listingRepository = listingRepository;
        this.bookingRepository = bookingRepository;
        this.embeddingService = embeddingService;
    }

    @GetMapping
    public ResponseEntity<?> getOperators(
            @RequestParam(required = false) String country,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        if (page != null && size != null) {
            Pageable pageable = PageRequest.of(Math.max(0, page), Math.min(100, Math.max(1, size)));
            if (country != null && !country.isBlank()) {
                return ResponseEntity.ok(operatorRepository.findByCountry(country, pageable));
            }
            return ResponseEntity.ok(operatorRepository.findByIsActiveTrue(pageable));
        }

        if (country != null && !country.isBlank()) {
            return ResponseEntity.ok(operatorRepository.findByCountry(country));
        }
        return ResponseEntity.ok(operatorRepository.findByIsActiveTrue());
    }

    @PostMapping
    public ResponseEntity<Operator> createOperator(@Valid @RequestBody Operator operator) {
        Operator saved = operatorRepository.save(operator);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{operatorId}/listings")
    public ResponseEntity<?> createListing(
            @PathVariable UUID operatorId,
            @Valid @RequestBody Listing listing) {
        try {
            Operator operator = operatorRepository.findById(operatorId)
                    .orElseThrow(() -> new IllegalArgumentException("Operator not found: " + operatorId));

            listing.setOperator(operator);

            String textToEmbed = String.format("%s %s %s %s",
                    listing.getTitle(), listing.getDescription(), listing.getCity(), listing.getCategory().name());
            float[] embedding = embeddingService.embed(textToEmbed);
            listing.setEmbedding(embedding);

            Listing saved = listingRepository.save(listing);
            log.info("Created and embedded listing '{}' for operator '{}'", saved.getTitle(), operator.getBusinessName());
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            log.error("Failed to create listing: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{operatorId}/dashboard")
    public ResponseEntity<?> getDashboard(@PathVariable UUID operatorId) {
        Operator operator = operatorRepository.findById(operatorId)
                .orElse(null);

        String name = operator != null ? operator.getBusinessName() : "Demo Grassroots Operator";
        String country = operator != null ? operator.getCountry() : "Ghana";
        String currency = "GHS";

        List<Listing> listings = operator != null
                ? listingRepository.findByOperatorIdAndIsActiveTrue(operatorId)
                : listingRepository.findAll().stream().limit(5).toList();

        List<Booking> bookings = operator != null
                ? bookingRepository.findByListingOperatorId(operatorId)
                : List.of();

        BigDecimal totalRevenue = bookings.stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.PAYMENT_CONFIRMED
                        || b.getStatus() == Booking.BookingStatus.SETTLED_TO_OPERATOR)
                .map(Booking::getOperatorAmountLocal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long confirmedCount = bookings.stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.PAYMENT_CONFIRMED
                        || b.getStatus() == Booking.BookingStatus.SETTLED_TO_OPERATOR)
                .count();

        Map<String, Object> response = Map.of(
                "operatorName", name,
                "country", country,
                "currency", currency,
                "totalRevenueLocal", totalRevenue,
                "confirmedBookings", confirmedCount,
                "listingCount", listings.size(),
                "listings", listings
        );

        return ResponseEntity.ok(response);
    }
}
