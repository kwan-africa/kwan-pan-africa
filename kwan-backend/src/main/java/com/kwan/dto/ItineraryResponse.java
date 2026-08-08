package com.kwan.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class ItineraryResponse {
    private UUID itineraryId;
    private String destination;
    private String country;
    private int totalDays;
    private String pace;
    private BigDecimal estimatedTotalCostUsd;
    private List<DayPlan> days = new ArrayList<>();
    private List<String> travelTips = new ArrayList<>();
    private TransportSummary transportSummary;
    private String languageNote;

    public ItineraryResponse() {}

    public static ItineraryResponseBuilder builder() { return new ItineraryResponseBuilder(); }

    public static class ItineraryResponseBuilder {
        private UUID itineraryId;
        private String destination;
        private String country;
        private int totalDays;
        private String pace;
        private BigDecimal estimatedTotalCostUsd;
        private List<DayPlan> days = new ArrayList<>();
        private List<String> travelTips = new ArrayList<>();
        private TransportSummary transportSummary;
        private String languageNote;

        public ItineraryResponseBuilder itineraryId(UUID itineraryId) { this.itineraryId = itineraryId; return this; }
        public ItineraryResponseBuilder destination(String destination) { this.destination = destination; return this; }
        public ItineraryResponseBuilder country(String country) { this.country = country; return this; }
        public ItineraryResponseBuilder totalDays(int totalDays) { this.totalDays = totalDays; return this; }
        public ItineraryResponseBuilder pace(String pace) { this.pace = pace; return this; }
        public ItineraryResponseBuilder estimatedTotalCostUsd(BigDecimal estimatedTotalCostUsd) { this.estimatedTotalCostUsd = estimatedTotalCostUsd; return this; }
        public ItineraryResponseBuilder days(List<DayPlan> days) { this.days = days; return this; }
        public ItineraryResponseBuilder travelTips(List<String> travelTips) { this.travelTips = travelTips; return this; }
        public ItineraryResponseBuilder transportSummary(TransportSummary transportSummary) { this.transportSummary = transportSummary; return this; }
        public ItineraryResponseBuilder languageNote(String languageNote) { this.languageNote = languageNote; return this; }

        public ItineraryResponse build() {
            ItineraryResponse r = new ItineraryResponse();
            r.setItineraryId(itineraryId);
            r.setDestination(destination);
            r.setCountry(country);
            r.setTotalDays(totalDays);
            r.setPace(pace);
            r.setEstimatedTotalCostUsd(estimatedTotalCostUsd);
            r.setDays(days != null ? days : new ArrayList<>());
            r.setTravelTips(travelTips != null ? travelTips : new ArrayList<>());
            r.setTransportSummary(transportSummary);
            r.setLanguageNote(languageNote);
            return r;
        }
    }

    public UUID getItineraryId() { return itineraryId; }
    public void setItineraryId(UUID itineraryId) { this.itineraryId = itineraryId; }

    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public int getTotalDays() { return totalDays; }
    public void setTotalDays(int totalDays) { this.totalDays = totalDays; }

    public String getPace() { return pace; }
    public void setPace(String pace) { this.pace = pace; }

    public BigDecimal getEstimatedTotalCostUsd() { return estimatedTotalCostUsd; }
    public void setEstimatedTotalCostUsd(BigDecimal estimatedTotalCostUsd) { this.estimatedTotalCostUsd = estimatedTotalCostUsd; }

    public List<DayPlan> getDays() { return days; }
    public void setDays(List<DayPlan> days) { this.days = days; }

    public List<String> getTravelTips() { return travelTips; }
    public void setTravelTips(List<String> travelTips) { this.travelTips = travelTips; }

    public TransportSummary getTransportSummary() { return transportSummary; }
    public void setTransportSummary(TransportSummary transportSummary) { this.transportSummary = transportSummary; }

    public String getLanguageNote() { return languageNote; }
    public void setLanguageNote(String languageNote) { this.languageNote = languageNote; }

    public static class DayPlan {
        private int dayNumber;
        private String date;
        private String theme;
        private String aiNarrative;
        private BigDecimal estimatedDayCostUsd;
        private List<Activity> activities = new ArrayList<>();

        public DayPlan() {}

        public static DayPlanBuilder builder() { return new DayPlanBuilder(); }

        public static class DayPlanBuilder {
            private int dayNumber;
            private String date;
            private String theme;
            private String aiNarrative;
            private BigDecimal estimatedDayCostUsd;
            private List<Activity> activities = new ArrayList<>();

            public DayPlanBuilder dayNumber(int dayNumber) { this.dayNumber = dayNumber; return this; }
            public DayPlanBuilder date(String date) { this.date = date; return this; }
            public DayPlanBuilder theme(String theme) { this.theme = theme; return this; }
            public DayPlanBuilder aiNarrative(String aiNarrative) { this.aiNarrative = aiNarrative; return this; }
            public DayPlanBuilder estimatedDayCostUsd(BigDecimal estimatedDayCostUsd) { this.estimatedDayCostUsd = estimatedDayCostUsd; return this; }
            public DayPlanBuilder activities(List<Activity> activities) { this.activities = activities; return this; }

            public DayPlan build() {
                DayPlan d = new DayPlan();
                d.setDayNumber(dayNumber);
                d.setDate(date);
                d.setTheme(theme);
                d.setAiNarrative(aiNarrative);
                d.setEstimatedDayCostUsd(estimatedDayCostUsd);
                d.setActivities(activities != null ? activities : new ArrayList<>());
                return d;
            }
        }

        public int getDayNumber() { return dayNumber; }
        public void setDayNumber(int dayNumber) { this.dayNumber = dayNumber; }
        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        public String getTheme() { return theme; }
        public void setTheme(String theme) { this.theme = theme; }
        public String getAiNarrative() { return aiNarrative; }
        public void setAiNarrative(String aiNarrative) { this.aiNarrative = aiNarrative; }
        public BigDecimal getEstimatedDayCostUsd() { return estimatedDayCostUsd; }
        public void setEstimatedDayCostUsd(BigDecimal estimatedDayCostUsd) { this.estimatedDayCostUsd = estimatedDayCostUsd; }
        public List<Activity> getActivities() { return activities; }
        public void setActivities(List<Activity> activities) { this.activities = activities; }
    }

    public static class Activity {
        private String timeSlot;
        private String title;
        private String description;
        private String category;
        private String operatorName;
        private String operatorId;
        private String listingId;
        private BigDecimal priceLocal;
        private String localCurrency;
        private BigDecimal priceUsd;
        private String location;
        private String whatsappContact;
        private String bookingType;
        private boolean isBookable;
        private List<String> localTips = new ArrayList<>();
        private String dialectPhrase;

        public Activity() {}

        public static ActivityBuilder builder() { return new ActivityBuilder(); }

        public static class ActivityBuilder {
            private String timeSlot;
            private String title;
            private String description;
            private String category;
            private String operatorName;
            private String operatorId;
            private String listingId;
            private BigDecimal priceLocal;
            private String localCurrency;
            private BigDecimal priceUsd;
            private String location;
            private String whatsappContact;
            private String bookingType;
            private boolean isBookable;
            private List<String> localTips = new ArrayList<>();
            private String dialectPhrase;

            public ActivityBuilder timeSlot(String timeSlot) { this.timeSlot = timeSlot; return this; }
            public ActivityBuilder title(String title) { this.title = title; return this; }
            public ActivityBuilder description(String description) { this.description = description; return this; }
            public ActivityBuilder category(String category) { this.category = category; return this; }
            public ActivityBuilder operatorName(String operatorName) { this.operatorName = operatorName; return this; }
            public ActivityBuilder operatorId(String operatorId) { this.operatorId = operatorId; return this; }
            public ActivityBuilder listingId(String listingId) { this.listingId = listingId; return this; }
            public ActivityBuilder priceLocal(BigDecimal priceLocal) { this.priceLocal = priceLocal; return this; }
            public ActivityBuilder localCurrency(String localCurrency) { this.localCurrency = localCurrency; return this; }
            public ActivityBuilder priceUsd(BigDecimal priceUsd) { this.priceUsd = priceUsd; return this; }
            public ActivityBuilder location(String location) { this.location = location; return this; }
            public ActivityBuilder whatsappContact(String whatsappContact) { this.whatsappContact = whatsappContact; return this; }
            public ActivityBuilder bookingType(String bookingType) { this.bookingType = bookingType; return this; }
            public ActivityBuilder isBookable(boolean isBookable) { this.isBookable = isBookable; return this; }
            public ActivityBuilder localTips(List<String> localTips) { this.localTips = localTips; return this; }
            public ActivityBuilder dialectPhrase(String dialectPhrase) { this.dialectPhrase = dialectPhrase; return this; }

            public Activity build() {
                Activity a = new Activity();
                a.setTimeSlot(timeSlot);
                a.setTitle(title);
                a.setDescription(description);
                a.setCategory(category);
                a.setOperatorName(operatorName);
                a.setOperatorId(operatorId);
                a.setListingId(listingId);
                a.setPriceLocal(priceLocal);
                a.setLocalCurrency(localCurrency);
                a.setPriceUsd(priceUsd);
                a.setLocation(location);
                a.setWhatsappContact(whatsappContact);
                a.setBookingType(bookingType);
                a.setBookable(isBookable);
                a.setLocalTips(localTips != null ? localTips : new ArrayList<>());
                a.setDialectPhrase(dialectPhrase);
                return a;
            }
        }

        public String getTimeSlot() { return timeSlot; }
        public void setTimeSlot(String timeSlot) { this.timeSlot = timeSlot; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getOperatorName() { return operatorName; }
        public void setOperatorName(String operatorName) { this.operatorName = operatorName; }
        public String getOperatorId() { return operatorId; }
        public void setOperatorId(String operatorId) { this.operatorId = operatorId; }
        public String getListingId() { return listingId; }
        public void setListingId(String listingId) { this.listingId = listingId; }
        public BigDecimal getPriceLocal() { return priceLocal; }
        public void setPriceLocal(BigDecimal priceLocal) { this.priceLocal = priceLocal; }
        public String getLocalCurrency() { return localCurrency; }
        public void setLocalCurrency(String localCurrency) { this.localCurrency = localCurrency; }
        public BigDecimal getPriceUsd() { return priceUsd; }
        public void setPriceUsd(BigDecimal priceUsd) { this.priceUsd = priceUsd; }
        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
        public String getWhatsappContact() { return whatsappContact; }
        public void setWhatsappContact(String whatsappContact) { this.whatsappContact = whatsappContact; }
        public String getBookingType() { return bookingType; }
        public void setBookingType(String bookingType) { this.bookingType = bookingType; }
        public boolean isBookable() { return isBookable; }
        public void setBookable(boolean bookable) { isBookable = bookable; }
        public List<String> getLocalTips() { return localTips; }
        public void setLocalTips(List<String> localTips) { this.localTips = localTips; }
        public String getDialectPhrase() { return dialectPhrase; }
        public void setDialectPhrase(String dialectPhrase) { this.dialectPhrase = dialectPhrase; }
    }

    public static class TransportSummary {
        private String gettingAroundTip;
        private List<TransportOption> options = new ArrayList<>();

        public TransportSummary() {}

        public static TransportSummaryBuilder builder() { return new TransportSummaryBuilder(); }

        public static class TransportSummaryBuilder {
            private String gettingAroundTip;
            private List<TransportOption> options = new ArrayList<>();

            public TransportSummaryBuilder gettingAroundTip(String gettingAroundTip) { this.gettingAroundTip = gettingAroundTip; return this; }
            public TransportSummaryBuilder options(List<TransportOption> options) { this.options = options; return this; }

            public TransportSummary build() {
                TransportSummary t = new TransportSummary();
                t.setGettingAroundTip(gettingAroundTip);
                t.setOptions(options != null ? options : new ArrayList<>());
                return t;
            }
        }

        public String getGettingAroundTip() { return gettingAroundTip; }
        public void setGettingAroundTip(String gettingAroundTip) { this.gettingAroundTip = gettingAroundTip; }
        public List<TransportOption> getOptions() { return options; }
        public void setOptions(List<TransportOption> options) { this.options = options; }
    }

    public static class TransportOption {
        private String type;
        private String description;
        private String typicalFare;
        private String tip;

        public TransportOption() {}

        public static TransportOptionBuilder builder() { return new TransportOptionBuilder(); }

        public static class TransportOptionBuilder {
            private String type;
            private String description;
            private String typicalFare;
            private String tip;

            public TransportOptionBuilder type(String type) { this.type = type; return this; }
            public TransportOptionBuilder description(String description) { this.description = description; return this; }
            public TransportOptionBuilder typicalFare(String typicalFare) { this.typicalFare = typicalFare; return this; }
            public TransportOptionBuilder tip(String tip) { this.tip = tip; return this; }

            public TransportOption build() {
                TransportOption t = new TransportOption();
                t.setType(type);
                t.setDescription(description);
                t.setTypicalFare(typicalFare);
                t.setTip(tip);
                return t;
            }
        }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getTypicalFare() { return typicalFare; }
        public void setTypicalFare(String typicalFare) { this.typicalFare = typicalFare; }
        public String getTip() { return tip; }
        public void setTip(String tip) { this.tip = tip; }
    }
}
