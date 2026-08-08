package com.kwan.dto;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class ItineraryRequest {
    private String destination;
    private String country = "GH";
    private LocalDate startDate;
    private LocalDate endDate;
    private double budgetUsd = 500;
    private List<String> interests = new ArrayList<>();
    private String pace = "MODERATE";
    private int groupSize = 1;
    private String preferredLanguage = "en";
    private boolean includeInformalTransport = true;
    private boolean includeLocalMarkets = true;
    private boolean includeCommunityTips = true;
    private boolean includeHomestays = false;

    public ItineraryRequest() {}

    public int getTotalDays() {
        if (startDate == null || endDate == null) return 1;
        return (int) java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate);
    }

    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public double getBudgetUsd() { return budgetUsd; }
    public void setBudgetUsd(double budgetUsd) { this.budgetUsd = budgetUsd; }

    public List<String> getInterests() { return interests; }
    public void setInterests(List<String> interests) { this.interests = interests != null ? interests : new ArrayList<>(); }

    public String getPace() { return pace; }
    public void setPace(String pace) { this.pace = pace; }

    public int getGroupSize() { return groupSize; }
    public void setGroupSize(int groupSize) { this.groupSize = groupSize; }

    public String getPreferredLanguage() { return preferredLanguage; }
    public void setPreferredLanguage(String preferredLanguage) { this.preferredLanguage = preferredLanguage; }

    public boolean isIncludeInformalTransport() { return includeInformalTransport; }
    public void setIncludeInformalTransport(boolean includeInformalTransport) { this.includeInformalTransport = includeInformalTransport; }

    public boolean isIncludeLocalMarkets() { return includeLocalMarkets; }
    public void setIncludeLocalMarkets(boolean includeLocalMarkets) { this.includeLocalMarkets = includeLocalMarkets; }

    public boolean isIncludeCommunityTips() { return includeCommunityTips; }
    public void setIncludeCommunityTips(boolean includeCommunityTips) { this.includeCommunityTips = includeCommunityTips; }

    public boolean isIncludeHomestays() { return includeHomestays; }
    public void setIncludeHomestays(boolean includeHomestays) { this.includeHomestays = includeHomestays; }
}
