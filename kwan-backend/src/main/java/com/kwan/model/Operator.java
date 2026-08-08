package com.kwan.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "operators", indexes = {
    @Index(name = "idx_operator_email", columnList = "email", unique = true),
    @Index(name = "idx_operator_country", columnList = "country")
})
public class Operator {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(columnDefinition = "uuid", updatable = false)
    private UUID id;

    @Column(nullable = false)
    private String businessName;

    @Column(nullable = false, unique = true)
    private String email;

    private String whatsappNumber;
    private String instagramHandle;
    private String website;

    @Column(nullable = false)
    private String country;

    private String city;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String momoWalletNumber;
    private String momoProvider;
    private String paystackRecipientCode;

    private boolean isActive = true;
    private boolean isVerified = false;

    @OneToMany(mappedBy = "operator", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Listing> listings = new ArrayList<>();

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt;

    public Operator() {}

    public Operator(UUID id, String businessName, String email, String whatsappNumber, String instagramHandle, String website, String country, String city, String description, String momoWalletNumber, String momoProvider, String paystackRecipientCode, boolean isActive, boolean isVerified, List<Listing> listings, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.businessName = businessName;
        this.email = email;
        this.whatsappNumber = whatsappNumber;
        this.instagramHandle = instagramHandle;
        this.website = website;
        this.country = country;
        this.city = city;
        this.description = description;
        this.momoWalletNumber = momoWalletNumber;
        this.momoProvider = momoProvider;
        this.paystackRecipientCode = paystackRecipientCode;
        this.isActive = isActive;
        this.isVerified = isVerified;
        this.listings = listings != null ? listings : new ArrayList<>();
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
        this.updatedAt = updatedAt;
    }

    public static OperatorBuilder builder() { return new OperatorBuilder(); }

    public static class OperatorBuilder {
        private UUID id;
        private String businessName;
        private String email;
        private String whatsappNumber;
        private String instagramHandle;
        private String website;
        private String country;
        private String city;
        private String description;
        private String momoWalletNumber;
        private String momoProvider;
        private String paystackRecipientCode;
        private boolean isActive = true;
        private boolean isVerified = false;
        private List<Listing> listings = new ArrayList<>();
        private LocalDateTime createdAt = LocalDateTime.now();
        private LocalDateTime updatedAt;

        public OperatorBuilder id(UUID id) { this.id = id; return this; }
        public OperatorBuilder businessName(String businessName) { this.businessName = businessName; return this; }
        public OperatorBuilder email(String email) { this.email = email; return this; }
        public OperatorBuilder whatsappNumber(String whatsappNumber) { this.whatsappNumber = whatsappNumber; return this; }
        public OperatorBuilder instagramHandle(String instagramHandle) { this.instagramHandle = instagramHandle; return this; }
        public OperatorBuilder website(String website) { this.website = website; return this; }
        public OperatorBuilder country(String country) { this.country = country; return this; }
        public OperatorBuilder city(String city) { this.city = city; return this; }
        public OperatorBuilder description(String description) { this.description = description; return this; }
        public OperatorBuilder momoWalletNumber(String momoWalletNumber) { this.momoWalletNumber = momoWalletNumber; return this; }
        public OperatorBuilder momoProvider(String momoProvider) { this.momoProvider = momoProvider; return this; }
        public OperatorBuilder paystackRecipientCode(String paystackRecipientCode) { this.paystackRecipientCode = paystackRecipientCode; return this; }
        public OperatorBuilder isActive(boolean isActive) { this.isActive = isActive; return this; }
        public OperatorBuilder isVerified(boolean isVerified) { this.isVerified = isVerified; return this; }
        public OperatorBuilder listings(List<Listing> listings) { this.listings = listings; return this; }
        public OperatorBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public OperatorBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Operator build() {
            return new Operator(id, businessName, email, whatsappNumber, instagramHandle, website, country, city, description, momoWalletNumber, momoProvider, paystackRecipientCode, isActive, isVerified, listings, createdAt, updatedAt);
        }
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getWhatsappNumber() { return whatsappNumber; }
    public void setWhatsappNumber(String whatsappNumber) { this.whatsappNumber = whatsappNumber; }

    public String getInstagramHandle() { return instagramHandle; }
    public void setInstagramHandle(String instagramHandle) { this.instagramHandle = instagramHandle; }

    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getMomoWalletNumber() { return momoWalletNumber; }
    public void setMomoWalletNumber(String momoWalletNumber) { this.momoWalletNumber = momoWalletNumber; }

    public String getMomoProvider() { return momoProvider; }
    public void setMomoProvider(String momoProvider) { this.momoProvider = momoProvider; }

    public String getPaystackRecipientCode() { return paystackRecipientCode; }
    public void setPaystackRecipientCode(String paystackRecipientCode) { this.paystackRecipientCode = paystackRecipientCode; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public boolean isVerified() { return isVerified; }
    public void setVerified(boolean verified) { isVerified = verified; }

    public List<Listing> getListings() { return listings; }
    public void setListings(List<Listing> listings) { this.listings = listings; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @PreUpdate
    void onUpdate() { updatedAt = LocalDateTime.now(); }
}
