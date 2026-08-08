package com.kwan.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "listings", indexes = {
    @Index(name = "idx_listing_country", columnList = "country"),
    @Index(name = "idx_listing_city", columnList = "city"),
    @Index(name = "idx_listing_category", columnList = "category"),
    @Index(name = "idx_listing_active", columnList = "isActive")
})
public class Listing {

    public enum ListingCategory {
        DAY_TOUR, MULTI_DAY_TOUR, ACCOMMODATION, FOOD_EXPERIENCE,
        TRANSPORT, CULTURAL_EXPERIENCE, STREET_VENDOR, ADVENTURE,
        WELLNESS, PHOTOGRAPHY, COMMUNITY_TIP
    }

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(columnDefinition = "uuid", updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "operator_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties("listings")
    private Operator operator;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ListingCategory category;

    private BigDecimal priceAmount;
    private String priceCurrency;

    @Column(nullable = false)
    private String country;
    private String city;
    private String locationDetails;

    @Column(columnDefinition = "vector(768)")
    private float[] embedding;

    private String whatsappBookingLink;
    private String instagramHandle;
    private String externalPlaceId;

    @Column(columnDefinition = "TEXT[]")
    private String[] imageUrls;

    @Column(columnDefinition = "TEXT[]")
    private String[] tags;

    private Integer durationHours;
    private Integer maxGroupSize;

    private boolean isActive = true;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt;

    public Listing() {}

    public Listing(UUID id, Operator operator, String title, String description, ListingCategory category, BigDecimal priceAmount, String priceCurrency, String country, String city, String locationDetails, float[] embedding, String whatsappBookingLink, String instagramHandle, String externalPlaceId, String[] imageUrls, String[] tags, Integer durationHours, Integer maxGroupSize, boolean isActive, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.operator = operator;
        this.title = title;
        this.description = description;
        this.category = category;
        this.priceAmount = priceAmount;
        this.priceCurrency = priceCurrency;
        this.country = country;
        this.city = city;
        this.locationDetails = locationDetails;
        this.embedding = embedding;
        this.whatsappBookingLink = whatsappBookingLink;
        this.instagramHandle = instagramHandle;
        this.externalPlaceId = externalPlaceId;
        this.imageUrls = imageUrls;
        this.tags = tags;
        this.durationHours = durationHours;
        this.maxGroupSize = maxGroupSize;
        this.isActive = isActive;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
        this.updatedAt = updatedAt;
    }

    public static ListingBuilder builder() { return new ListingBuilder(); }

    public static class ListingBuilder {
        private UUID id;
        private Operator operator;
        private String title;
        private String description;
        private ListingCategory category;
        private BigDecimal priceAmount;
        private String priceCurrency;
        private String country;
        private String city;
        private String locationDetails;
        private float[] embedding;
        private String whatsappBookingLink;
        private String instagramHandle;
        private String externalPlaceId;
        private String[] imageUrls;
        private String[] tags;
        private Integer durationHours;
        private Integer maxGroupSize;
        private boolean isActive = true;
        private LocalDateTime createdAt = LocalDateTime.now();
        private LocalDateTime updatedAt;

        public ListingBuilder id(UUID id) { this.id = id; return this; }
        public ListingBuilder operator(Operator operator) { this.operator = operator; return this; }
        public ListingBuilder title(String title) { this.title = title; return this; }
        public ListingBuilder description(String description) { this.description = description; return this; }
        public ListingBuilder category(ListingCategory category) { this.category = category; return this; }
        public ListingBuilder priceAmount(BigDecimal priceAmount) { this.priceAmount = priceAmount; return this; }
        public ListingBuilder priceCurrency(String priceCurrency) { this.priceCurrency = priceCurrency; return this; }
        public ListingBuilder country(String country) { this.country = country; return this; }
        public ListingBuilder city(String city) { this.city = city; return this; }
        public ListingBuilder locationDetails(String locationDetails) { this.locationDetails = locationDetails; return this; }
        public ListingBuilder embedding(float[] embedding) { this.embedding = embedding; return this; }
        public ListingBuilder whatsappBookingLink(String whatsappBookingLink) { this.whatsappBookingLink = whatsappBookingLink; return this; }
        public ListingBuilder instagramHandle(String instagramHandle) { this.instagramHandle = instagramHandle; return this; }
        public ListingBuilder externalPlaceId(String externalPlaceId) { this.externalPlaceId = externalPlaceId; return this; }
        public ListingBuilder imageUrls(String[] imageUrls) { this.imageUrls = imageUrls; return this; }
        public ListingBuilder tags(String[] tags) { this.tags = tags; return this; }
        public ListingBuilder durationHours(Integer durationHours) { this.durationHours = durationHours; return this; }
        public ListingBuilder maxGroupSize(Integer maxGroupSize) { this.maxGroupSize = maxGroupSize; return this; }
        public ListingBuilder isActive(boolean isActive) { this.isActive = isActive; return this; }
        public ListingBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public ListingBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Listing build() {
            return new Listing(id, operator, title, description, category, priceAmount, priceCurrency, country, city, locationDetails, embedding, whatsappBookingLink, instagramHandle, externalPlaceId, imageUrls, tags, durationHours, maxGroupSize, isActive, createdAt, updatedAt);
        }
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Operator getOperator() { return operator; }
    public void setOperator(Operator operator) { this.operator = operator; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public ListingCategory getCategory() { return category; }
    public void setCategory(ListingCategory category) { this.category = category; }

    public BigDecimal getPriceAmount() { return priceAmount; }
    public void setPriceAmount(BigDecimal priceAmount) { this.priceAmount = priceAmount; }

    public String getPriceCurrency() { return priceCurrency; }
    public void setPriceCurrency(String priceCurrency) { this.priceCurrency = priceCurrency; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getLocationDetails() { return locationDetails; }
    public void setLocationDetails(String locationDetails) { this.locationDetails = locationDetails; }

    public float[] getEmbedding() { return embedding; }
    public void setEmbedding(float[] embedding) { this.embedding = embedding; }

    public String getWhatsappBookingLink() { return whatsappBookingLink; }
    public void setWhatsappBookingLink(String whatsappBookingLink) { this.whatsappBookingLink = whatsappBookingLink; }

    public String getInstagramHandle() { return instagramHandle; }
    public void setInstagramHandle(String instagramHandle) { this.instagramHandle = instagramHandle; }

    public String getExternalPlaceId() { return externalPlaceId; }
    public void setExternalPlaceId(String externalPlaceId) { this.externalPlaceId = externalPlaceId; }

    public String[] getImageUrls() { return imageUrls; }
    public void setImageUrls(String[] imageUrls) { this.imageUrls = imageUrls; }

    public String[] getTags() { return tags; }
    public void setTags(String[] tags) { this.tags = tags; }

    public Integer getDurationHours() { return durationHours; }
    public void setDurationHours(Integer durationHours) { this.durationHours = durationHours; }

    public Integer getMaxGroupSize() { return maxGroupSize; }
    public void setMaxGroupSize(Integer maxGroupSize) { this.maxGroupSize = maxGroupSize; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @PreUpdate
    void onUpdate() { updatedAt = LocalDateTime.now(); }
}
