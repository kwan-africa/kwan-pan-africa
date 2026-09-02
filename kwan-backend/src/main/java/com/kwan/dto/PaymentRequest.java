package com.kwan.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public class PaymentRequest {
    @NotBlank(message = "listingId is required")
    private String listingId;

    @NotBlank(message = "touristEmail is required")
    @Email(message = "touristEmail must be a valid email address")
    private String touristEmail;

    @NotBlank(message = "touristName is required")
    private String touristName;

    @Positive(message = "amountUsd must be greater than 0")
    private double amountUsd;

    private String specialRequests;

    @Min(value = 1, message = "groupSize must be at least 1")
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
