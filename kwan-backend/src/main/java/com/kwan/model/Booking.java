package com.kwan.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "bookings", indexes = {
    @Index(name = "idx_booking_listing", columnList = "listing_id"),
    @Index(name = "idx_booking_reference", columnList = "paystackReference", unique = true)
})
public class Booking {

    public enum BookingStatus {
        PENDING_PAYMENT, PAYMENT_CONFIRMED, SETTLED_TO_OPERATOR, CANCELLED, REFUNDED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(columnDefinition = "uuid", updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "listing_id", nullable = false)
    private Listing listing;

    private String touristEmail;
    private String touristName;

    @Column(nullable = false, unique = true)
    private String paystackReference;

    private BigDecimal amountUsd;
    private BigDecimal platformFeeUsd;
    private BigDecimal operatorAmountLocal;
    private String operatorCurrency;

    private String settlementTransferId;

    @Enumerated(EnumType.STRING)
    private BookingStatus status = BookingStatus.PENDING_PAYMENT;

    private int groupSize = 1;

    @Column(columnDefinition = "TEXT")
    private String specialRequests;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime paidAt;
    private LocalDateTime settledAt;

    public Booking() {}

    public Booking(UUID id, Listing listing, String touristEmail, String touristName, String paystackReference, BigDecimal amountUsd, BigDecimal platformFeeUsd, BigDecimal operatorAmountLocal, String operatorCurrency, String settlementTransferId, BookingStatus status, int groupSize, String specialRequests, LocalDateTime createdAt, LocalDateTime paidAt, LocalDateTime settledAt) {
        this.id = id;
        this.listing = listing;
        this.touristEmail = touristEmail;
        this.touristName = touristName;
        this.paystackReference = paystackReference;
        this.amountUsd = amountUsd;
        this.platformFeeUsd = platformFeeUsd;
        this.operatorAmountLocal = operatorAmountLocal;
        this.operatorCurrency = operatorCurrency;
        this.settlementTransferId = settlementTransferId;
        this.status = status != null ? status : BookingStatus.PENDING_PAYMENT;
        this.groupSize = groupSize;
        this.specialRequests = specialRequests;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
        this.paidAt = paidAt;
        this.settledAt = settledAt;
    }

    public static BookingBuilder builder() { return new BookingBuilder(); }

    public static class BookingBuilder {
        private UUID id;
        private Listing listing;
        private String touristEmail;
        private String touristName;
        private String paystackReference;
        private BigDecimal amountUsd;
        private BigDecimal platformFeeUsd;
        private BigDecimal operatorAmountLocal;
        private String operatorCurrency;
        private String settlementTransferId;
        private BookingStatus status = BookingStatus.PENDING_PAYMENT;
        private int groupSize = 1;
        private String specialRequests;
        private LocalDateTime createdAt = LocalDateTime.now();
        private LocalDateTime paidAt;
        private LocalDateTime settledAt;

        public BookingBuilder id(UUID id) { this.id = id; return this; }
        public BookingBuilder listing(Listing listing) { this.listing = listing; return this; }
        public BookingBuilder touristEmail(String touristEmail) { this.touristEmail = touristEmail; return this; }
        public BookingBuilder touristName(String touristName) { this.touristName = touristName; return this; }
        public BookingBuilder paystackReference(String paystackReference) { this.paystackReference = paystackReference; return this; }
        public BookingBuilder amountUsd(BigDecimal amountUsd) { this.amountUsd = amountUsd; return this; }
        public BookingBuilder platformFeeUsd(BigDecimal platformFeeUsd) { this.platformFeeUsd = platformFeeUsd; return this; }
        public BookingBuilder operatorAmountLocal(BigDecimal operatorAmountLocal) { this.operatorAmountLocal = operatorAmountLocal; return this; }
        public BookingBuilder operatorCurrency(String operatorCurrency) { this.operatorCurrency = operatorCurrency; return this; }
        public BookingBuilder settlementTransferId(String settlementTransferId) { this.settlementTransferId = settlementTransferId; return this; }
        public BookingBuilder status(BookingStatus status) { this.status = status; return this; }
        public BookingBuilder groupSize(int groupSize) { this.groupSize = groupSize; return this; }
        public BookingBuilder specialRequests(String specialRequests) { this.specialRequests = specialRequests; return this; }
        public BookingBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public BookingBuilder paidAt(LocalDateTime paidAt) { this.paidAt = paidAt; return this; }
        public BookingBuilder settledAt(LocalDateTime settledAt) { this.settledAt = settledAt; return this; }

        public Booking build() {
            return new Booking(id, listing, touristEmail, touristName, paystackReference, amountUsd, platformFeeUsd, operatorAmountLocal, operatorCurrency, settlementTransferId, status, groupSize, specialRequests, createdAt, paidAt, settledAt);
        }
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Listing getListing() { return listing; }
    public void setListing(Listing listing) { this.listing = listing; }

    public String getTouristEmail() { return touristEmail; }
    public void setTouristEmail(String touristEmail) { this.touristEmail = touristEmail; }

    public String getTouristName() { return touristName; }
    public void setTouristName(String touristName) { this.touristName = touristName; }

    public String getPaystackReference() { return paystackReference; }
    public void setPaystackReference(String paystackReference) { this.paystackReference = paystackReference; }

    public BigDecimal getAmountUsd() { return amountUsd; }
    public void setAmountUsd(BigDecimal amountUsd) { this.amountUsd = amountUsd; }

    public BigDecimal getPlatformFeeUsd() { return platformFeeUsd; }
    public void setPlatformFeeUsd(BigDecimal platformFeeUsd) { this.platformFeeUsd = platformFeeUsd; }

    public BigDecimal getOperatorAmountLocal() { return operatorAmountLocal; }
    public void setOperatorAmountLocal(BigDecimal operatorAmountLocal) { this.operatorAmountLocal = operatorAmountLocal; }

    public String getOperatorCurrency() { return operatorCurrency; }
    public void setOperatorCurrency(String operatorCurrency) { this.operatorCurrency = operatorCurrency; }

    public String getSettlementTransferId() { return settlementTransferId; }
    public void setSettlementTransferId(String settlementTransferId) { this.settlementTransferId = settlementTransferId; }

    public BookingStatus getStatus() { return status; }
    public void setStatus(BookingStatus status) { this.status = status; }

    public int getGroupSize() { return groupSize; }
    public void setGroupSize(int groupSize) { this.groupSize = groupSize; }

    public String getSpecialRequests() { return specialRequests; }
    public void setSpecialRequests(String specialRequests) { this.specialRequests = specialRequests; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }

    public LocalDateTime getSettledAt() { return settledAt; }
    public void setSettledAt(LocalDateTime settledAt) { this.settledAt = settledAt; }
}
