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

Over **90% of West Africa's tourism economy operates informally** (*Ghana Statistical Service IBES 2024: 92.3% of business establishments*). The most authentic boutique eco-lodges, grassroots cultural guides, street food artisans, and trotro transit routes are not listed on global booking platforms (Airbnb, Expedia, Viator). 

### The Visibility-Execution Chasm
* **Global platforms require Western commercial bank accounts (IBAN/SWIFT):** Local grassroots guides and artisans rely solely on Mobile Money (MTN MoMo, Telecel Cash) and are completely excluded.
* **Cash Traps & Broken ATMs:** International travelers arrive cashless or exhaust paper Cedis, suffering bank card security timeouts on street ATMs.
* **Extortionate Middlemen:** Traditional street tour syndicates extract 30% to 50% of visitor spend, leaving hosts without digital identities, reviews, or capital formation.
* **GTA Regulatory Modernization:** To meet international safety benchmarks, the Ghana Tourism Authority (GTA) is increasing compliance enforcement. Kwan provides the digital accreditation bridge (Ghana Card verification + GTA safety benchmarks) so grassroots operators can formalize without prohibitive costs.

---

## ⚡ What Kwan Does

Kwan connects international and diaspora travelers directly to verified grassroots guides, artisans, and cultural hosts — paid safely and instantly via Mobile Money.

| Feature | Detail |
|:---|:---|
| 🤖 **AI Cultural Concierge** | `pgvector` RAG + Gemini generates personalized multi-day itineraries tailored to traveler budget and energy styles |
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
Copy `.env.example` to `.env` and populate your API credentials:
```env
GEMINI_API_KEY=your_gemini_api_key
PAYSTACK_PUBLIC_KEY=pk_test_...
PAYSTACK_SECRET_KEY=sk_test_...
GOOGLE_PLACES_API_KEY=your_google_places_key
```

### 2. Launch PostgreSQL with pgvector
```bash
docker-compose up postgres -d
```

### 3. Start Spring Boot Backend
```bash
cd kwan-backend
./mvnw spring-boot:run
# Server listening on http://localhost:8080
```

### 4. Run Frontend Web App
```bash
cd kwan-flutter/web
python -m http.server 8081
# Open http://localhost:8081 in any modern browser
```

### 5. Run Flutter Mobile Application
```bash
cd kwan-flutter
flutter pub get
flutter run -d chrome
# Or target Android / iOS emulator:
# flutter run -d emulator-5554
```

---

## 📡 Core API Endpoints

| Method | Endpoint | Description |
|:---|:---|:---|
| `POST` | `/api/itinerary/generate` | RAG-powered cultural itinerary generation via Gemini |
| `GET` | `/api/operators` | List verified grassroots operators & artisans |
| `POST` | `/api/operators` | Register new operator with Ghana Card verification |
| `POST` | `/api/operators/{id}/listings` | Add experience listing (auto-embedded into pgvector) |
| `POST` | `/api/admin/ingest?city=Accra&country=GH` | Ingest live verified Google Places data |
| `POST` | `/api/payments/initialize` | Initialize Paystack escrow card transaction |
| `GET` | `/api/payments/verify` | Verify payment and disburse Mobile Money payout |

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
