package com.kwan.dto;

public class PaymentRequest {
    private String listingId;
    private String touristEmail;
    private String touristName;
    private double amountUsd;
    private String specialRequests;
    private int groupSize = 1;

    public PaymentRequest() {}

    public String getListingId() { return listingId; }
    public void setListingId(String listingId) { this.listingId = listingId; }

    public String getTouristEmail() { return touristEmail; }
    public void setTouristEmail(String touristEmail) { this.touristEmail = touristEmail; }

    public String getTouristName() { return touristName; }
    public void setTouristName(String touristName) { this.touristName = touristName; }

    public double getAmountUsd() { return amountUsd; }
    public void setAmountUsd(double amountUsd) { this.amountUsd = amountUsd; }

    public String getSpecialRequests() { return specialRequests; }
    public void setSpecialRequests(String specialRequests) { this.specialRequests = specialRequests; }

    public int getGroupSize() { return groupSize; }
    public void setGroupSize(int groupSize) { this.groupSize = groupSize; }
}
