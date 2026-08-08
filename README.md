# KWAN — West African Travel Platform
### *"Kwan" — Twi (Ghana) for "The Path / The Way"*

> **Digitizing the invisible 90% of West Africa's informal tourism economy.**

[![PAAIS 2026](https://img.shields.io/badge/PAAIS%202026-Pitch%20Competitor-F2A93B?style=flat-square)](https://panafricanaisummit.com)
[![Track](https://img.shields.io/badge/Track-FinTech%20%26%20Inclusive%20Finance-159873?style=flat-square)]()
[![Flutter](https://img.shields.io/badge/Flutter-3.44-54C5F8?style=flat-square&logo=flutter)]()
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-6DB33F?style=flat-square&logo=spring)]()
[![Paystack](https://img.shields.io/badge/Payments-Paystack%20Escrow-00C3F7?style=flat-square)]()

---

## 🌍 The Problem

Over **90% of West Africa's tourism economy operates informally.** The best boutique eco-lodges, grassroots cultural guides, trotro transit routes, and market artisans are not listed on Expedia, Airbnb, or Booking.com. They rely entirely on WhatsApp and Instagram DMs.

- Foreign tourists face severe friction paying local hosts who lack formal bank accounts
- Local operators risk non-payment with zero fraud protection
- $8.3 billion in annual West African tourism revenue bypasses informal operators entirely

---

## ✅ What Kwan Does

**Kwan** is an AI-powered travel concierge and SME onboarding platform that routes international travel spend directly into the hands of verified West African local operators — with no bank account required.

| Feature | Detail |
|:---|:---|
| 🤖 **AI Itinerary Engine** | pgvector RAG + Gemini generates personalized multi-day itineraries by budget, city, and energy style |
| 💳 **Paystack Escrow** | International card/Apple Pay collected, held in escrow, released 24h post-tour |
| 📱 **Mobile Money Payouts** | 95% of travel spend settles directly into MTN MoMo / Telecel Cash wallets |
| 🪪 **Gov ID Verification** | 4-step Ghana Card / NIN wizard with Dojah KYC API against NIA Ghana & NIMC Nigeria databases |
| 🚌 **Informal Transit Maps** | Trotro, danfo, pragya tuk-tuk routes with local hand-signal guides |
| 🗣️ **Dialect AI Assistant** | Native audio pronunciation in Twi, Yoruba, Hausa, Igbo & West African Pidgin |
| 🏠 **Dynamic Homestay Pricing** | Occupancy-based pricing engine anchored to 5-star hotel benchmarks |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│           Flutter App (Web + Android + iOS)      │
│       Tourist Planner  |  SME Operator Portal    │
└──────────────────┬──────────────────────────────┘
                   │ REST API
┌──────────────────▼──────────────────────────────┐
│         Spring Boot 3 Backend (Java 21)          │
│                                                  │
│  ┌─────────────────────────────────────────┐    │
│  │  RAG Pipeline                           │    │
│  │  1. Query → Gemini text-embedding-004   │    │
│  │  2. pgvector cosine similarity search   │    │
│  │  3. Live Google Places ingestion        │    │
│  │  4. Gemini 1.5 Flash response gen       │    │
│  └─────────────────────────────────────────┘    │
│                                                  │
│  ┌───────────┐   ┌───────────┐  ┌────────────┐  │
│  │ PostgreSQL│   │  Paystack │  │  Dojah KYC │  │
│  │ + pgvector│   │  Escrow   │  │  (NIA/NIMC)│  │
│  └───────────┘   └───────────┘  └────────────┘  │
└──────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Docker Desktop
- Java 21 + Maven
- Flutter 3.22+
- Gemini API key — free at [aistudio.google.com](https://aistudio.google.com)
- Paystack account — free at [paystack.com](https://paystack.com)
- Dojah account — free at [dojah.io](https://dojah.io) *(for live ID verification)*

### 1. Configure Environment

Copy `.env.example` to `.env` and fill in your keys:

```env
GEMINI_API_KEY=your_gemini_api_key
PAYSTACK_PUBLIC_KEY=pk_test_...
PAYSTACK_SECRET_KEY=sk_test_...
GOOGLE_PLACES_API_KEY=your_google_places_key
```

### 2. Start Database

```bash
docker-compose up postgres -d
```

### 3. Run Backend API

```bash
cd kwan-backend
mvn spring-boot:run
# API live at http://localhost:8080
```

### 4. Run Web App

```bash
cd kwan-flutter/web
python -m http.server 8081
# Open http://localhost:8081
```

### 5. Run Flutter Mobile

```bash
cd kwan-flutter
flutter pub get
flutter run -d chrome
# Or for Android:
flutter run -d emulator-5554
```

---

## 📡 API Reference

| Method | Endpoint | Description |
|:---|:---|:---|
| `POST` | `/api/itinerary/generate` | RAG-powered itinerary via Gemini |
| `GET` | `/api/operators` | List verified local operators |
| `POST` | `/api/operators` | Register new SME operator |
| `POST` | `/api/operators/{id}/listings` | Add listing (auto vector-embedded) |
| `POST` | `/api/admin/ingest?city=Accra&country=GH` | Ingest live Google Places data |
| `POST` | `/api/payments/initialize` | Initialize Paystack escrow payment |
| `GET` | `/api/payments/verify` | Verify payment + trigger MoMo payout |

---

## 🗂️ Project Structure

```
kwan-ai/
├── kwan-backend/          # Spring Boot 3 + Java 21 REST API
│   └── src/main/java/
│       ├── controller/    # REST endpoints
│       ├── service/       # RAG + Paystack + MoMo logic
│       └── model/         # Operator, Listing, Payment entities
├── kwan-flutter/          # Flutter cross-platform app
│   ├── lib/features/
│   │   ├── tourist/       # Tourist itinerary planner screens
│   │   └── operator/      # SME host verification portal
│   └── web/               # Standalone web SPA (index.html)
│       └── assets/audio/  # Pre-rendered native dialect MP3s
├── docker-compose.yml     # PostgreSQL + pgvector container
├── generate_audio.py      # Dialect audio asset generator
└── PAAIS_2026_PITCH_SUBMISSION.md
```

---

## 🎯 Impact

> *Kwan routes international travel dollars into the wallets of informal West African operators — no bank account, no middleman, no friction.*

**GitHub:** [github.com/kwan-africa/kwan-pan-africa](https://github.com/kwan-africa/kwan-pan-africa)

- **Ghana & Nigeria** launch markets (West Africa rollout roadmap)
- **MoMo-first** — designed for the 57% of West Africans without bank accounts
- **AI-native** — not a directory, a personalized intelligence layer
- **Dialect AI** — the only travel platform that speaks Twi, Yoruba, Hausa, Igbo & Pidgin

---

## 📋 License

MIT — Built for PAAIS 2026 · West African grassroots travel tech
