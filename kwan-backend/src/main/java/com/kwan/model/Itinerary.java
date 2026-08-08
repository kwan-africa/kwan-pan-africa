package com.kwan.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "itineraries")
public class Itinerary {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(columnDefinition = "uuid", updatable = false)
    private UUID id;

    private String destination;
    private String country;
    private int totalDays;

    @Column(columnDefinition = "TEXT")
    private String generatedJson;

    private String pace;
    private double estimatedTotalCostUsd;
    private String preferredLanguage;

    private String touristEmail;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Itinerary() {}

    public Itinerary(UUID id, String destination, String country, int totalDays, String generatedJson, String pace, double estimatedTotalCostUsd, String preferredLanguage, String touristEmail, LocalDateTime createdAt) {
        this.id = id;
        this.destination = destination;
        this.country = country;
        this.totalDays = totalDays;
        this.generatedJson = generatedJson;
        this.pace = pace;
        this.estimatedTotalCostUsd = estimatedTotalCostUsd;
        this.preferredLanguage = preferredLanguage;
        this.touristEmail = touristEmail;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
    }

    public static ItineraryBuilder builder() { return new ItineraryBuilder(); }

    public static class ItineraryBuilder {
        private UUID id;
        private String destination;
        private String country;
        private int totalDays;
        private String generatedJson;
        private String pace;
        private double estimatedTotalCostUsd;
        private String preferredLanguage;
        private String touristEmail;
        private LocalDateTime createdAt = LocalDateTime.now();

        public ItineraryBuilder id(UUID id) { this.id = id; return this; }
        public ItineraryBuilder destination(String destination) { this.destination = destination; return this; }
        public ItineraryBuilder country(String country) { this.country = country; return this; }
        public ItineraryBuilder totalDays(int totalDays) { this.totalDays = totalDays; return this; }
        public ItineraryBuilder generatedJson(String generatedJson) { this.generatedJson = generatedJson; return this; }
        public ItineraryBuilder pace(String pace) { this.pace = pace; return this; }
        public ItineraryBuilder estimatedTotalCostUsd(double estimatedTotalCostUsd) { this.estimatedTotalCostUsd = estimatedTotalCostUsd; return this; }
        public ItineraryBuilder preferredLanguage(String preferredLanguage) { this.preferredLanguage = preferredLanguage; return this; }
        public ItineraryBuilder touristEmail(String touristEmail) { this.touristEmail = touristEmail; return this; }
        public ItineraryBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Itinerary build() {
            return new Itinerary(id, destination, country, totalDays, generatedJson, pace, estimatedTotalCostUsd, preferredLanguage, touristEmail, createdAt);
        }
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public int getTotalDays() { return totalDays; }
    public void setTotalDays(int totalDays) { this.totalDays = totalDays; }

    public String getGeneratedJson() { return generatedJson; }
    public void setGeneratedJson(String generatedJson) { this.generatedJson = generatedJson; }

    public String getPace() { return pace; }
    public void setPace(String pace) { this.pace = pace; }

    public double getEstimatedTotalCostUsd() { return estimatedTotalCostUsd; }
    public void setEstimatedTotalCostUsd(double estimatedTotalCostUsd) { this.estimatedTotalCostUsd = estimatedTotalCostUsd; }

    public String getPreferredLanguage() { return preferredLanguage; }
    public void setPreferredLanguage(String preferredLanguage) { this.preferredLanguage = preferredLanguage; }

    public String getTouristEmail() { return touristEmail; }
    public void setTouristEmail(String touristEmail) { this.touristEmail = touristEmail; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
