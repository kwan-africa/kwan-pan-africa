# Kwan pilot MVP

Kwan is a focused web prototype for validating one question: will diaspora travellers trust a card payment flow that releases a local guide's Mobile Money payout after the experience is complete?

## The flow

1. A traveller describes the experience they want in Accra.
2. Kwan chooses one guide from a small pilot roster using simple interest matching.
3. The traveller generates one shareable payment-link preview.
4. A local test payment is recorded as held, then released as a 90% MoMo test payout after completion is confirmed.

The interface intentionally avoids a multi-day itinerary builder, guide directory, generic dashboard, testimonials, or fabricated trust signals. Host review language describes the specific pilot mechanism: a manual identity and Mobile Money wallet review.

## Run locally

```powershell
npm.cmd install
npm.cmd run dev
```

To make a production build:

```powershell
npm.cmd run build
```

## Important prototype boundary

This build contains only local sample data. The payment-link and payout steps are UI prototypes: it does not submit card details, call Paystack, persist personal data, or transfer money to a Mobile Money wallet.

Before running a real pilot, add a backend that creates Paystack transactions server-side, verifies payment webhooks, stores consent and booking records, and executes approved payouts through the appropriate regulated payment-provider flow.
