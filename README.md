# KWAN — Pan-African Travel Concierge & Inclusive FinTech Rail
### *"Kwan" — Twi (Ghana) for "The Path / The Way"*

> **Digitizing the invisible 90% of West Africa's informal tourism economy through AI-powered itinerary composition and Mobile Money escrow settlement.**

[![PAAIS 2026](https://img.shields.io/badge/PAAIS%202026-Pitch%20Competitor-F2A93B?style=flat-square)](https://panafricanaisummit.com)
[![Track](https://img.shields.io/badge/Track-FinTech%20%26%20Inclusive%20Finance-159873?style=flat-square)]()
[![Flutter](https://img.shields.io/badge/Flutter-3.44-54C5F8?style=flat-square&logo=flutter)]()
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-6DB33F?style=flat-square&logo=spring)]()
[![Paystack](https://img.shields.io/badge/Payments-Paystack%20Escrow-00C3F7?style=flat-square)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🌍 The Problem & Strategic Context

In Ghana's tourism and hospitality landscape, **informal establishments make up approximately 75% to 80% of all operating units** (GTA & GSS Data). While luxury hotels and registered travel agencies represent the visible formal tier, the vast majority of the tourism-adjacent supply chain is comprised of micro-sized, unregistered businesses:
* **Catering Sub-Sector (77% Informal):** 77% of catering enterprises are traditional "chop bars", mobile street food artisans, and informal drinking spots (*GTA 2024 Report*). Only 23% are formal restaurants.
* **Lodging & Homestays:** Outside Accra and Kumasi, informal accommodation units (unregistered guesthouses, rural eco-lodges, homestays) heavily outnumber formal hotels.
* **The 80% Employment vs. 1% Levy Paradox:** Informal tourism drives roughly **80% of total sector employment**, yet escapes formal licensing and tax rails. Consequently, the statutory **1% National Tourism Levy (Act 817)** is completely uncollected across 75–80% of operating units.
* **Global OTA Banking Wall:** Platforms like Booking.com and Airbnb strictly require commercial bank accounts (IBAN/SWIFT) and corporate registries—locking out local chop bars, guides, and homestays that rely exclusively on Mobile Money (MTN MoMo, Telecel Cash).
* **GTA Regulatory Modernization:** The Ghana Tourism Authority is actively pushing to formalize informal chop bars and sites. Kwan provides the digital accreditation and escrow rail to formalize operators without imposing burdensome overhead.

---

## ⚡ What Kwan Does

Kwan connects international and diaspora travelers directly to verified grassroots guides, artisans, and cultural hosts — paid safely and instantly via Mobile Money.

| Feature | Detail |
|:---|:---|
| 🤖 **AI Cultural Concierge** | Server-side classification plus a deterministic, verified cultural retrieval layer generates explainable itinerary suggestions |
| 💳 **Paystack Escrow** | International cards (Visa/Mastercard) and Apple Pay collected upfront and held in secure escrow |
| 📱 **Mobile Money Payouts** | 90% of booking fees settle directly into the host's MTN MoMo or Telecel Cash wallet upon 4-digit code completion |
| 🪪 **Gov ID Verification** | 4-step Ghana Card / NIN verification wizard creating verified host digital identities |
| 🚌 **Informal Transit Maps** | Trotro, danfo, and pragya routes with localized hand-signal guidance |
| 🗣️ **Dialect AI Assistant** | Phonetic dialect audio assistant for Twi (*Akwaaba*, *Te so kakra*), Yoruba, and West African Pidgin |

---

## 📊 Key Numbers & Unit Economics

* **Market Opportunity:** Ghana tourism $4.7B USD | Bank of Ghana MoMo volume GH¢3T/yr (8.1B transactions)
* **Take Rate:** 10% transparent platform fee (90% settled directly to the host via Mobile Money)
* **Gross Contribution Margin:** 60% margin on every booking
* **Host Economic Mobility:** GHS 4,788/month projected average income (3.9x local living wage)
* **Pilot Beachhead:** 150+ grassroots artisans and guides in the Ga-Mashie Heritage Guild (Jamestown, Accra)

---

## 🏗️ Architecture & System Design

```
┌──────────────────────────────────────────────────────────────────────────┐
│                     Flutter App (Web + Android + iOS)                    │
│   Tourist Discovery  |  Cultural Concierge  |  Host Verification Portal  │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │ REST / JSON
┌────────────────────────────────────▼─────────────────────────────────────┐
│                    Spring Boot 3 Backend (Java 21)                       │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │  RAG & Discovery Pipeline                                          │  │
│  │  1. Prompt / Preference Query → Gemini text-embedding-004          │  │
│  │  2. PostgreSQL + pgvector Cosine Similarity Search                 │  │
│  │  3. Google Places API Context Enrichment                           │  │
│  │  4. Gemini 1.5 Flash Response & Structured Itinerary Gen           │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌─────────────────────────┐  ┌─────────────────┐  ┌──────────────────┐  │
│  │   PostgreSQL + pgvector │  │ Paystack Escrow │  │ Dojah / NIA KYC  │  │
│  │    Listings & Operators │  │  Card ➔ MoMo    │  │ Ghana Card / NIN │  │
│  └─────────────────────────┘  └─────────────────┘  └──────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Java 21 + Maven 3.9+
- Flutter 3.22+
- Gemini API key — [aistudio.google.com](https://aistudio.google.com)
- Paystack account — [paystack.com](https://paystack.com)

### 1. Configure Environment
Copy `.env.example` to `.env` and populate your credentials:
```env
GEMINI_API_KEY=your_gemini_api_key
PAYSTACK_PUBLIC_KEY=pk_test_...
PAYSTACK_SECRET_KEY=sk_test_...
APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_appwrite_project_id
APPWRITE_API_KEY=your_scoped_api_key
```

### 2. Node/Express Backend & Appwrite Schema
```bash
cd server
npm install
npm run setup:db   # Provisions Appwrite collections (hosts, bookings, escrow_ledgers) and seeds data
npm run dev        # Backend live at http://localhost:3001
```

### 3. React Web Application (Vite)
```bash
cd kwan-web-app
npm install
npm run dev        # Web app live at http://localhost:5173
```

### Verification before a demo

Run the production checks from the repository root:

```bash
cd kwan-web-app
npm run lint
npm run build
npm run preview
```

The Node API must be configured with real sandbox credentials before payment
testing. The browser only talks to the API; Appwrite and Paystack secret
credentials belong in the server environment and must never be added to
`VITE_*` variables.

For a backend smoke test:

```bash
cd server
npm install
npm start
curl http://localhost:3001/health
```

Before sharing the repository, inspect both tracked history and the compiled
frontend:

```bash
git log --all --full-history -- "*.env"
git log -p --all | Select-String -Pattern "appwrite|paystack" -CaseSensitive:$false
Select-String -Path kwan-web-app/dist/assets/*.js -Pattern "sk_test|sk_live"
```

The payment webhook must be exercised with a real Paystack sandbox signature.
Unsigned requests and requests signed with a different secret are expected to
return an error. Appwrite collection permissions should be verified directly
in the Appwrite console: `hosts` may be publicly readable, while
`bookings` and `escrow_ledgers` must remain server-only.

## Current build-checklist status

### Complete in this repository

- [x] Environment files are ignored and examples contain placeholders only.
- [x] Repository history was searched for `.env`, Appwrite, and Paystack
      references; no real credential values were found.
- [x] Node backend scripts, dotenv loading, restricted CORS, validation,
      centralized errors, transition logging, classify rate limiting, LLM
      timeout/fallback, webhook HMAC verification, release idempotency, and
      scheduled auto-release are implemented.
- [x] Production mode refuses to use the local host roster or local-only
      booking persistence when Appwrite is unavailable.
- [x] Auto-release refreshes persisted `escrow_held` bookings from Appwrite
      before processing due releases.
- [x] Frontend loading/error states, whitespace validation, server-side
      itinerary recalculation, four-digit PIN validation, and API-only
      configuration are implemented.
- [x] Frontend lint, production build, backend syntax checks, local health,
      classify, host filtering, itinerary, invalid-input, and unsigned-webhook
      smoke checks pass.

### Still required before calling the launch complete

- [ ] Configure a fresh scoped Appwrite API key and verify the three
      collections and permissions in the Appwrite console.
- [ ] Hand-check the seeded host documents in Appwrite.
- [ ] Configure Paystack sandbox credentials, complete a documented test-card
      payment, and verify a sandbox Mobile Money settlement.
- [ ] Register and reach the Paystack webhook at the deployed Railway URL.
- [ ] Set Railway secrets and confirm its `/health` endpoint.
- [ ] Set Vercel `VITE_API_BASE` to the Railway API URL and test the deployed
      frontend, not localhost.
- [ ] Repeat the happy path, wrong-PIN path, backend-down path, and five-run
      repeat test against the deployed services.
- [ ] Perform responsive testing on the presentation device/network and record
      the deployed fallback demo.

Until those external checks are complete, the code is locally validated but
the deployment should be treated as pre-launch rather than production-ready.

### Live Render status (last checked 2026-09-20 13:45 UTC)

`https://kwan-pan-africa.onrender.com/health` responds successfully, and the
deployed classify endpoint responds, `/api/hosts?theme=adventure` reports
`source: "appwrite"`, and checkout initialization returns a Paystack checkout
URL. Unsigned webhook requests are rejected with `400`, and invalid themes are
rejected with `400`. The Render service is API-only, so its root URL returning
`404` is expected; the React frontend must be hosted separately and point
`VITE_API_BASE` at this service. Still required are a real sandbox card
completion, webhook delivery from Paystack, Mobile Money settlement, and a
full deployed frontend flow. Never put the Paystack secret or Appwrite API key
in Vercel or any `VITE_*` variable.

### 4. Alternative: Spring Boot + Flutter Stack

The deployed web demo uses the Node/Express + React/Appwrite path above. The
Spring Boot + Flutter stack is retained as a separate mobile/backend
implementation and is not part of the Vercel/Railway web deployment.
```bash
# Launch PostgreSQL + pgvector
docker-compose up postgres -d

# Spring Boot 3 Backend
cd kwan-backend
./mvnw spring-boot:run   # API live at http://localhost:8080

# Flutter Cross-Platform Client
cd kwan-flutter
flutter pub get
flutter run -d chrome
```

---

## 📡 Web API Endpoints (Node/Express)

| Method | Endpoint | Description |
|:---|:---|:---|
| `POST` | `/api/classify` | Classify a traveler request into a fixed cultural theme |
| `GET` | `/api/hosts?theme=X` | Return verified hosts for an allowed theme |
| `POST` | `/api/itinerary` | Recalculate server-authoritative itinerary pricing |
| `POST` | `/api/checkout/init` | Persist a booking and initialize Paystack checkout |
| `POST` | `/api/checkout/webhook` | Verify Paystack signature and hold escrow |
| `GET` | `/api/checkout/verify/:booking_id` | Verify Paystack status and recover a delayed webhook |
| `GET` | `/api/checkout/status/:booking_id` | Read the stored booking status |
| `POST` | `/api/escrow/release` | Verify the PIN and release the payout |

---

## 🗂️ Codebase Structure

```
kwan-ai/
├── kwan-backend/                   # Spring Boot 3 + Java 21 Microservice
│   ├── src/main/java/com/kwan/
│   │   ├── controller/             # REST Endpoints (Itinerary, Operator, Payment)
│   │   ├── service/                # RAG, Vector Embedding, Paystack Escrow
│   │   ├── repository/             # Spring Data JPA + pgvector queries
│   │   └── model/                  # Domain Entities (Operator, Listing, Booking)
│   └── src/main/resources/         # application.yml, schema.sql, init.sql
├── kwan-flutter/                   # Flutter Multi-Platform App (Web/Android/iOS)
│   ├── lib/
│   │   ├── core/                   # Theme, Router, HTTP Services, Models
│   │   └── features/               # Discover, Booking, Escrow, Dialect AI, Transit
│   └── web/                        # Web client application with interactive escrow UI
└── docker-compose.yml              # PostgreSQL 16 + pgvector container configuration
```

---

## 🎯 PAAIS 2026 Hackathon Presentation Flow

1. **Hook (30s):** 50M diaspora travelers. Zero trusted, banked way to experience grassroots culture.
2. **Problem (45s):** 92.3% of cultural guides and artisans are informal and excluded from global booking platforms.
3. **Solution (60s):** Interactive Walkthrough — AI Concierge + Card-to-MoMo Escrow flow.
4. **Market (30s):** $4.7B Ghana tourism sector, 71M mobile money accounts in Ghana, GH¢3T volume.
5. **Traction (30s):** 4 verified pilot experiences, 150+ mapped grassroots artisans, live functional Escrow MVP.
6. **Business Model (45s):** 10% platform take rate, 60% gross contribution margin, zero buyer surcharge.
7. **Team (30s):** Lead architect & technical founder with grassroots community depth.
8. **Ask (30s):** Top 5 finalist selection, pilot guild formalization, and mentorship access.

---

## 📋 License

Distributed under the MIT License. Built for PAAIS 2026 Hack-AI-Thon & West African Grassroots Tourism Development.
