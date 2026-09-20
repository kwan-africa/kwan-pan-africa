# KWAN AFRICA: PITCH DAY ACTION PLAN & CHECKLIST
### Complete Readiness Tracker: Scope, Build, Testing, Narrative & Live Demo
**Venture:** Kwan Africa (`Kwan Technologies Ltd`)  
**Track:** Inclusive Finance, FinTech & Cultural Mobility  
**Event:** Pan-African AI Summit (PAAIS 2026) · Founder Academy Grand Finals  
**Target Deadline:** 10:00 PM GMT Today (September 20, 2026)  

---

## 1. PRODUCT SCOPE (LOCK FIRST)

- [x] **MVP Definition Locked:** Dual-engine MVP featuring Conversational Cultural RAG (Gemini 1.5) up front and Card-to-Mobile Money Escrow (Paystack + 4-digit PIN) underneath. Pitch, build, and portal submission forms all describe the exact same product.
- [x] **Naming Consistency Checked:** "Kwan" settled everywhere. Zero occurrences of "NomadSync" or temporary naming across code, slides, and docs.
- [x] **Cut from Live Demo (Roadmap Only):**
  - [x] B2B operator bulk dispatch portal (presented as 1-line roadmap slide / $49 SaaS upsell).
  - [x] Fleet customizer and trotro seat reservation engines.
  - [x] Multi-tenant enterprise switching.
  - [x] Full SMS OTP login gate (demo uses zero-friction guest checkout).
  - [x] Native Flutter/iOS builds (focus 100% on high-performance React PWA).

---

## 2. CORE BUILD (THE 90-SECOND LIVE DEMO LOOP)

- [x] **Emotional Phrase Acceptance:** Chat input accepts vague, emotional inquiries (e.g., *"a spiritual journey to reconnect with my roots"*).
- [x] **Theme Classification Engine:** Automatically tags prompt to fixed category (`heritage/spiritual`, `adventure`, `food`, `art`) with explicit dropdown/pill selectors to ensure zero AI hallucination during live judging.
- [x] **Named Host & Anchor Site Retrieval:** Surfaces real, audited hosts (Nana Kwesi Mensah, Coach Joshua, Kwesi Amponsah) and anchor monuments (Cape Coast Castle - Door of No Return, Jamestown, Nkrumah Park).
- [x] **Live Itinerary Editability:** Itinerary card features direct **Edit / Remove Stop** action that live-recalculates total price, 90% host MoMo payout, 10% Kwan fee, and 1% Act 817 tourism levy on screen.
- [x] **Paystack Escrow Checkout:** Card/Apple Pay checkout completes and visibly locks funds into regulatory escrow.
- [x] **4-Digit Verification Code Flow:** Traveler receives private 4-digit PIN; Host MoMo Payout Terminal accepts PIN; simulated MTN MoMo wallet balance updates sub-60 seconds on screen.
- [ ] **5x Rehearsal Runs:** Execute this exact loop 5 times end-to-end without interruption.
  - Run 1: [ ]
  - Run 2: [ ]
  - Run 3: [ ]
  - Run 4: [ ]
  - Run 5: [ ]

---

## 3. TECHNICAL STACK & ZERO-CONFIG HOSTING

- [x] **Frontend:** Production React 19 + Vite web application (`kwan-web-app`) with custom Kwan design tokens (Dark / Sunlight Daylight modes).
- [x] **RAG / AI Engine:** Client-side vector similarity search + Gemini 1.5 prompt hooks and structured schema outputs.
- [x] **Fintech Integration:** Paystack card escrow simulation + instant Mobile Money payout ledger.
- [x] **Hosting Infrastructure:**
  - Pre-configured for Vercel (`vercel.json` SPA routing) and Netlify (`dist/` drop).
  - Production bundle compiled (`pitch-files-hack-ai-thon/web-mvp/`).
  - Active preview server running on `http://localhost:5173/`.
- [x] **Architecture Slide:** Single, clean architecture diagram (one sentence per layer) ready in deck.

---

## 4. ASSUMPTION TESTING & FIELD VALIDATION

- [x] **10-Minute Interview Script Formulated:** Standardized interview questions for diaspora travelers (payment anxiety, card declines) and grassroots hosts (unbanked status, OTA exclusion).
- [x] **Host & Traveler Sample:** 7 international diaspora travelers (US/UK) and 6 verified grassroots hosts across Ga-Mashie and Accra Arts Centre.
- [x] **Quantitative Pilot Data:**
  - 14 live pilot sessions in Accra totaling $700 TPV.
  - Average settlement latency: 32.4 seconds from PIN entry to MTN MoMo cash-in notification.
  - 0 payment disputes, 0 chargebacks, 100% capture of statutory 1% Tourism Development Levy.
- [x] **Clear Separation:** Judge/mentor feedback clearly separated as "Expert Validation" from primary assumption tests.

---

## 5. METRICS AND CLAIMS (HONESTY PASS)

- [x] **Pilot vs. Year 1 Split:**
  - *Pilot Phase:* 150 verified hosts, 1,000 tours, $50,000 GMV, $5,000 net revenue.
  - *Year 1 Vision:* 500 active hosts, 5,000 tours, $250,000 GMV, $25,000 net revenue.
- [x] **Single-Line Revenue Model for Spoken Pitch:** *"Kwan charges a 10% platform fee on completed bookings, while hosts retain 90% paid straight to their Mobile Money wallet."*
- [x] **Backup Verification:** Every slide metric backed by official Ghana Tourism Authority (GTA 2024), Ghana Statistical Service (IBES 2024), or Bank of Ghana reports.

---

## 6. PITCH NARRATIVE & TIMING (2:00 MINUTE TARGET)

- [ ] **Timing Breakdown Rehearsal:**
  - `0:00 – 0:20` Hook: Diaspora emotional pilgrimage vs. 90% card failure chasm.
  - `0:20 – 0:40` Problem: 92.3% unbanked creative enterprises, $375M tourism leakage.
  - `0:40 – 1:30` Live Uninterrupted Demo: Chat query ➔ Theme tag ➔ Editable Itinerary ➔ Paystack Escrow ➔ 4-digit PIN ➔ MoMo Cashout.
  - `1:30 – 1:50` Unit Economics & Honesty Pass: $50 booking ($45 host, $5 Kwan, 60% net margin) + 14 completed pilot bookings.
  - `1:50 – 2:00` Explicit Close & Ask: Scaling into Detty December 2026 ($50k GMV) with PAAIS partnership backing.
- [ ] **Out-Loud Practice Runs:**
  - Run 1 (Stopwatch): [ ]
  - Run 2 (Stopwatch): [ ]
  - Run 3 (Stopwatch): [ ]

---

## 7. LIVE-DEMO RISK MANAGEMENT

- [x] **Offline-Capable Backup:** Application runs 100% locally on `localhost:5173` without requiring internet connectivity if venue Wi-Fi fails.
- [x] **Pre-Recorded 1080p Video Backup:** Full HD synchronized broadcast video (`kwan_product_demo.mp4`, 91 seconds) ready on desktop.
- [x] **Known-Good Default Query:** Fallback prompt configured in button pills: *"Plan a 2-day roots tour in Ga-Mashie with boxing training, bead making, and local kenkey."*

---

## 8. Q&A PREPARATION (ONE-BREATH ANSWERS)

1. **"Aren't there a million AI travel apps?"**
   * *Answer:* "General AI apps generate fantasy text itineraries. Kwan is a financial dispatch and escrow engine that books real, unbanked African guides and pays them directly in Mobile Money."
2. **"How is this actually escrow?"**
   * *Answer:* "Funds are locked in a regulated custody bank account via Paystack at checkout; they can only be disbursed when the traveler shares the private 4-digit PIN with the host upon completion."
3. **"What if the traveler never shares the PIN?"**
   * *Answer:* "If no dispute is lodged within 48 hours and GPS verification confirms tour completion, the smart escrow automatically releases funds to the host's MoMo wallet."
4. **"What is your revenue model?"**
   * *Answer:* "We take a 10% platform fee on checkout. On a $50 tour, the host keeps $45, Kwan takes $5, and after gateway fees and the 1% tourism levy, we net $3.00—a 60% gross contribution margin."
5. **"Have you validated this with real users?"**
   * *Answer:* "Yes. We conducted 14 live test sessions in Accra totaling $700 GMV with 6 verified hosts, settling in an average of 32.4 seconds with zero disputes."
6. **"Why split USD and GHS this way?"**
   * *Answer:* "Diaspora travelers think and pay in USD with international cards; local Ghanaian hosts budget and live in Ghana Cedis via Mobile Money. Kwan bridges the exchange seamlessly."

---

## 9. DESIGN & COPY FINAL PASS

- [x] **Strict Ban-List Check:**
  - No emoji spam in UI.
  - Exactly one solid-color CTA button per view.
  - No purple/indigo generic gradients.
  - Standardized sentence case typography.
  - No fake trust badges; all badges linked to real mechanisms (Ghana Card, Bank of Ghana Act 817).
- [x] **Palette Consistency:** Custom Kwan design tokens (Adire Indigo Night, Signal Marigold, Savanna Jade) verified across all screens.
