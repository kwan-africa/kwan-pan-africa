package com.kwan.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kwan.model.Booking;
import com.kwan.model.Listing;
import com.kwan.repository.BookingRepository;
import com.kwan.repository.ListingRepository;
import okhttp3.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;
import java.util.UUID;

@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final BookingRepository bookingRepository;
    private final ListingRepository listingRepository;

    @Value("${paystack.secret-key}")
    private String secretKey;

    @Value("${paystack.base-url}")
    private String paystackBase;

    @Value("${paystack.callback-url}")
    private String callbackUrl;

    @Value("${paystack.platform-fee-percent:5.0}")
    private double platformFeePercent;

    private final OkHttpClient http;
    private final ObjectMapper mapper = new ObjectMapper();
    private static final MediaType JSON = MediaType.get("application/json; charset=utf-8");

    private static final Map<String, Double> EXCHANGE_RATES = Map.of(
        "GHS", 15.5,
        "NGN", 1650.0,
        "KES", 130.0,
        "RWF", 1350.0,
        "XOF", 620.0
    );

    public PaymentService(BookingRepository bookingRepository, ListingRepository listingRepository, OkHttpClient http) {
        this.bookingRepository = bookingRepository;
        this.listingRepository = listingRepository;
        this.http = http;
    }

    public boolean verifyWebhookSignature(String payload, String signature) {
        if (signature == null || signature.isBlank() || secretKey == null || secretKey.isBlank()) {
            return false;
        }
        try {
            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA512");
            javax.crypto.spec.SecretKeySpec secretKeySpec = new javax.crypto.spec.SecretKeySpec(
                    secretKey.getBytes(java.nio.charset.StandardCharsets.UTF_8), "HmacSHA512");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(payload.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString().equalsIgnoreCase(signature);
        } catch (Exception e) {
            log.error("Error computing webhook HMAC-SHA512: {}", e.getMessage());
            return false;
        }
    }

    public Map<String, Object> processWebhook(String payload, String signature) throws IOException {
        if (!verifyWebhookSignature(payload, signature)) {
            throw new SecurityException("Invalid Paystack webhook signature");
        }
        JsonNode root = mapper.readTree(payload);
        String event = root.path("event").asText();
        log.info("Received verified Paystack webhook event: {}", event);

        if ("charge.success".equals(event)) {
            String reference = root.path("data").path("reference").asText();
            log.info("Processing successful charge for ref: {}", reference);
            return verifyAndSettle(reference);
        }
        return Map.of("status", "ignored", "event", event);
    }

    public Map<String, Object> initializePayment(
            UUID listingId, String touristEmail, String touristName,
            double amountUsd, String specialRequests, int groupSize) throws IOException {

        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found: " + listingId));

        String currency = listing.getPriceCurrency() != null ? listing.getPriceCurrency() : "GHS";
        double rate = EXCHANGE_RATES.getOrDefault(currency, 15.5);
        long amountInLocalSmallest = Math.round(amountUsd * rate * 100);

        String reference = "kwan-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);

        Booking booking = bookingRepository.save(Booking.builder()
                .listing(listing)
                .touristEmail(touristEmail)
                .touristName(touristName)
                .paystackReference(reference)
                .amountUsd(BigDecimal.valueOf(amountUsd))
                .platformFeeUsd(BigDecimal.valueOf(amountUsd * platformFeePercent / 100).setScale(2, RoundingMode.HALF_UP))
                .operatorAmountLocal(BigDecimal.valueOf(amountUsd * (1 - platformFeePercent / 100) * rate).setScale(2, RoundingMode.HALF_UP))
                .operatorCurrency(currency)
                .status(Booking.BookingStatus.PENDING_PAYMENT)
                .groupSize(groupSize)
                .specialRequests(specialRequests)
                .build());

        Map<String, Object> payload = Map.of(
            "email", touristEmail,
            "amount", amountInLocalSmallest,
            "currency", currency.equals("NGN") ? "NGN" : "GHS",
            "reference", reference,
            "callback_url", callbackUrl,
            "metadata", Map.of(
                "booking_id", booking.getId().toString(),
                "listing_title", listing.getTitle(),
                "operator_name", listing.getOperator() != null ? listing.getOperator().getBusinessName() : "Local Vendor",
                "tourist_name", touristName
            )
        );

        Request request = new Request.Builder()
                .url(paystackBase + "/transaction/initialize")
                .post(RequestBody.create(mapper.writeValueAsString(payload), JSON))
                .header("Authorization", "Bearer " + secretKey)
                .header("Content-Type", "application/json")
                .build();

        try (Response response = http.newCall(request).execute()) {
            JsonNode root = mapper.readTree(response.body().string());
            if (!root.path("status").asBoolean()) {
                throw new IOException("Paystack init failed: " + root.path("message").asText());
            }
            JsonNode data = root.path("data");
            log.info("Paystack payment initialized: ref={} amount={}{}",
                    reference, currency, amountInLocalSmallest / 100);
            return Map.of(
                "authorizationUrl", data.path("authorization_url").asText(),
                "reference", reference,
                "bookingId", booking.getId().toString(),
                "accessCode", data.path("access_code").asText()
            );
        }
    }

    public Map<String, Object> verifyAndSettle(String reference) throws IOException {
        Request verifyReq = new Request.Builder()
                .url(paystackBase + "/transaction/verify/" + reference)
                .get()
                .header("Authorization", "Bearer " + secretKey)
                .build();

        JsonNode verifyData;
        try (Response response = http.newCall(verifyReq).execute()) {
            JsonNode root = mapper.readTree(response.body().string());
            if (!root.path("status").asBoolean()) {
                throw new IOException("Paystack verify failed: " + root.path("message").asText());
            }
            verifyData = root.path("data");
        }

        String paystackStatus = verifyData.path("status").asText();
        if (!"success".equals(paystackStatus)) {
            return Map.of("status", "failed", "message", "Payment not completed: " + paystackStatus);
        }

        Booking booking = bookingRepository.findByPaystackReference(reference)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found for ref: " + reference));
        booking.setStatus(Booking.BookingStatus.PAYMENT_CONFIRMED);
        booking.setPaidAt(java.time.LocalDateTime.now());
        bookingRepository.save(booking);

        String operatorRecipientCode = booking.getListing().getOperator() != null
                ? booking.getListing().getOperator().getPaystackRecipientCode() : null;

        if (operatorRecipientCode != null && !operatorRecipientCode.isBlank()) {
            String transferId = initiateTransfer(booking, operatorRecipientCode);
            booking.setSettlementTransferId(transferId);
            booking.setStatus(Booking.BookingStatus.SETTLED_TO_OPERATOR);
            booking.setSettledAt(java.time.LocalDateTime.now());
            bookingRepository.save(booking);
            log.info("Settled {} {} to operator via Paystack transfer {}",
                    booking.getOperatorCurrency(), booking.getOperatorAmountLocal(), transferId);
        } else {
            log.warn("Operator has no Paystack recipient code — manual settlement required");
        }

        return Map.of(
            "status", "success",
            "bookingId", booking.getId().toString(),
            "operatorSettled", operatorRecipientCode != null,
            "message", "Payment confirmed. Operator will receive Mobile Money shortly."
        );
    }

    private String initiateTransfer(Booking booking, String recipientCode) throws IOException {
        long amountSmallest = booking.getOperatorAmountLocal()
                .multiply(BigDecimal.valueOf(100)).longValue();

        Map<String, Object> payload = Map.of(
            "source", "balance",
            "amount", amountSmallest,
            "recipient", recipientCode,
            "currency", booking.getOperatorCurrency() != null ? booking.getOperatorCurrency() : "GHS",
            "reason", "Kwan booking payout: " + booking.getListing().getTitle()
        );

        Request request = new Request.Builder()
                .url(paystackBase + "/transfer")
                .post(RequestBody.create(mapper.writeValueAsString(payload), JSON))
                .header("Authorization", "Bearer " + secretKey)
                .header("Content-Type", "application/json")
                .build();

        try (Response response = http.newCall(request).execute()) {
            JsonNode root = mapper.readTree(response.body().string());
            return root.path("data").path("transfer_code").asText();
        }
    }
}
