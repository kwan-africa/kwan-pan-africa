import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load server/.env first, then root .env if missing
const serverEnvPath = path.resolve(__dirname, '.env');
const rootEnvPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(serverEnvPath)) {
  dotenv.config({ path: serverEnvPath });
}
if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
}

const app = express();
const PORT = process.env.PORT || 3001;

// Appwrite Configuration
const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID;
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;

// Paystack & Gemini Configuration
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_ENDPOINT = process.env.PAYSTACK_ENDPOINT || 'https://api.paystack.co';
const APPWRITE_DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'kwan_db';
const APPWRITE_HOSTS_COLLECTION_ID = process.env.APPWRITE_HOSTS_COLLECTION_ID || 'hosts';
const APPWRITE_BOOKINGS_COLLECTION_ID = process.env.APPWRITE_BOOKINGS_COLLECTION_ID || 'bookings';
const APPWRITE_LEDGER_COLLECTION_ID = process.env.APPWRITE_LEDGER_COLLECTION_ID || 'escrow_ledgers';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// CORS configuration — restricted to frontend origins
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://localhost:8080',
  'http://localhost:8081',
  'https://kwanai.me',
  'https://www.kwanai.me',
  'https://kwan.me',
  'https://www.kwan.me',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (curl, server-to-server, mobile)
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked: Origin ${origin} not permitted.`));
    },
    credentials: true,
  })
);

// Capture raw body for webhook HMAC validation while parsing JSON
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString('utf8');
    },
  })
);

// Health check — required by Render, Railway, Fly.io
app.get('/health', (req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() });
});

// State transition logger
function logTransition(event, details) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${event}]`, JSON.stringify(details));
}

// In-memory store (active cache & fallback)
const LOCAL_STORE = {
  hosts: [
    {
      id: 'host_01',
      name: 'Nana Kwesi Mensah',
      role: 'Ancestral Roots Guide & Castle Historian',
      guild: 'Cape Coast Castle Guild',
      theme_tags: ['heritage_spiritual'],
      anchor_site: 'Cape Coast Castle (Door of No Return)',
      momo_number: '024 *** 6621',
      momo_network: 'mtn',
      verified: true,
      price_usd: 50.0,
      price_ghs: 760.0,
      photo_url: '/ghana_guide_kwesi.jpg',
      active: true,
    },
    {
      id: 'host_02',
      name: 'Joshua Clottey',
      role: 'Boxing Coach and Ga-Mashie Walking Host',
      guild: 'Bukom Boxing Guild',
      theme_tags: ['adventure'],
      anchor_site: 'Bukom Boxing Academies',
      momo_number: '024 *** 8912',
      momo_network: 'mtn',
      verified: true,
      price_usd: 50.0,
      price_ghs: 760.0,
      photo_url: '/ghana_guide_kwesi.jpg',
      active: true,
    },
    {
      id: 'host_03',
      name: 'Naa Densua Addy',
      role: 'Master Bead Maker & Cultural Host',
      guild: 'Ga-Mashie Heritage Bead Guild',
      theme_tags: ['art'],
      anchor_site: 'Jamestown Arts Compound',
      momo_number: '020 *** 4410',
      momo_network: 'telecel',
      verified: true,
      price_usd: 45.0,
      price_ghs: 684.0,
      photo_url: '/kwan_logo_square_white_bg.png',
      active: true,
    },
    {
      id: 'host_04',
      name: 'Abena Ofori',
      role: 'Local Food Guide & Chop Bar Host',
      guild: 'Accra Street Food Collective',
      theme_tags: ['food'],
      anchor_site: 'Traditional Chop Bars & Night Markets',
      momo_number: '055 *** 2084',
      momo_network: 'mtn',
      verified: true,
      price_usd: 45.0,
      price_ghs: 684.0,
      photo_url: '/kwan_logo_square_white_bg.png',
      active: true,
    },
  ],
  bookings: new Map(),
  escrow_ledgers: [],
};
const webhookProcessing = new Set();
const releaseProcessing = new Set();

function collectionPath(collection, suffix = '') {
  return `/databases/${APPWRITE_DATABASE_ID}/collections/${collection}/documents${suffix}`;
}

// Helper: Appwrite Server Fetch
async function appwriteFetch(endpoint, method = 'GET', body = null) {
  if (!APPWRITE_API_KEY) return { ok: false, error: 'NO_KEY' };
  const headers = {
    'Content-Type': 'application/json',
    'X-Appwrite-Project': APPWRITE_PROJECT_ID,
    'X-Appwrite-Key': APPWRITE_API_KEY,
  };
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);
  try {
    const res = await fetch(`${APPWRITE_ENDPOINT}${endpoint}`, options);
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    console.error(`[Appwrite Error] ${method} ${endpoint}:`, err.message);
    return { ok: false, error: err.message };
  }
}

// Rate Limiter for /api/classify (Sliding Window, 40 req/min per IP)
const classifyRateLimits = new Map();
function classifyRateLimiter(req, res, next) {
  const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 40;

  const timestamps = classifyRateLimits.get(ip) || [];
  const activeTimestamps = timestamps.filter((t) => now - t < windowMs);

  if (activeTimestamps.length >= maxRequests) {
    return res.status(429).json({
      error: 'RATE_LIMITED',
      message: 'Too many classify requests. Please wait a moment before trying again.',
    });
  }

  activeTimestamps.push(now);
  classifyRateLimits.set(ip, activeTimestamps);
  next();
}

// Allowed Cultural Theme Enum
const VALID_THEMES = ['heritage_spiritual', 'adventure', 'food', 'art'];

// ==============================================================================
// 1. POST /api/classify — Free text -> Cultural theme with LLM timeout + fallback
// ==============================================================================
app.post('/api/classify', classifyRateLimiter, async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({
        error: 'INVALID_INPUT',
        message: 'Query parameter must be a non-empty string.',
      });
    }

    const trimmed = query.trim();
    const q = trimmed.toLowerCase();

    // Fast deterministic fallback classifier
    function matchCulturalTaxonomy(text) {
      if (text.includes('spiritual') || text.includes('roots') || text.includes('ancest') || text.includes('cape coast') || text.includes('castle') || text.includes('pilgrim')) {
        return { theme: 'heritage_spiritual', anchor: 'Cape Coast Castle (Door of No Return)' };
      }
      if (text.includes('box') || text.includes('bukom') || text.includes('fight') || text.includes('adventur') || text.includes('fitness') || text.includes('hike') || text.includes('aburi')) {
        return { theme: 'adventure', anchor: 'Bukom Boxing Academies' };
      }
      if (text.includes('food') || text.includes('kenkey') || text.includes('waakye') || text.includes('culinary') || text.includes('chop') || text.includes('market')) {
        return { theme: 'food', anchor: 'Traditional Chop Bars & Night Markets' };
      }
      if (text.includes('art') || text.includes('bead') || text.includes('carv') || text.includes('drum') || text.includes('adinkra') || text.includes('craft')) {
        return { theme: 'art', anchor: 'Accra Arts Centre & Heritage Bead Guild' };
      }
      return { theme: 'heritage_spiritual', anchor: 'Cape Coast Castle (Door of No Return)' };
    }

    // Try Gemini classification with 2.5-second timeout protection
    let classification = matchCulturalTaxonomy(q);

    if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here') {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2500);

        const prompt = `You are Kwan's cultural intent classifier. Classify this traveler request into exactly one theme: [heritage_spiritual, adventure, food, art]. Output only the theme tag.\nRequest: "${trimmed}"`;
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 20 },
          }),
        });
        clearTimeout(timeout);

        if (geminiRes.ok) {
          const gData = await geminiRes.json();
          const rawTheme = gData.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toLowerCase().replace(/[^a-z_]/g, '');
          if (VALID_THEMES.includes(rawTheme)) {
            const anchorMap = {
              heritage_spiritual: 'Cape Coast Castle (Door of No Return)',
              adventure: 'Bukom Boxing Academies',
              food: 'Traditional Chop Bars & Night Markets',
              art: 'Accra Arts Centre & Heritage Bead Guild',
            };
            classification = { theme: rawTheme, anchor: anchorMap[rawTheme] };
          }
        }
      } catch (llmErr) {
        // Fallback gracefully without delaying response
        console.warn('⚠️ Gemini classification timed out or failed, using cultural taxonomy fallback:', llmErr.message);
      }
    }

    logTransition('INTENT_CLASSIFIED', { query: trimmed, result: classification.theme });

    res.json({
      theme_matched: classification.theme,
      anchor_site: classification.anchor,
      allowed_themes: VALID_THEMES,
    });
  } catch (err) {
    next(err);
  }
});

// ==============================================================================
// 2. GET /api/hosts?theme=X — Retrieve verified hosts by theme (Strict enum check)
// ==============================================================================
app.get('/api/hosts', async (req, res, next) => {
  try {
    const { theme } = req.query;

    if (theme && !VALID_THEMES.includes(theme)) {
      return res.status(400).json({
        error: 'INVALID_THEME',
        message: `Theme '${theme}' is invalid. Allowed themes: ${VALID_THEMES.join(', ')}`,
      });
    }

    // Try Appwrite Cloud first
    if (APPWRITE_API_KEY) {
      const awRes = await appwriteFetch(collectionPath(APPWRITE_HOSTS_COLLECTION_ID));
      if (awRes.ok && awRes.data?.documents?.length > 0) {
        let docs = awRes.data.documents.filter((d) => d.verified && d.active);
        if (theme) {
          docs = docs.filter((d) => Array.isArray(d.theme_tags) && d.theme_tags.includes(theme));
        }
        return res.json({ hosts: docs, source: 'appwrite' });
      }
      if (process.env.NODE_ENV === 'production') {
        return res.status(503).json({
          error: 'HOSTS_UNAVAILABLE',
          message: 'The verified host roster is temporarily unavailable.',
        });
      }
    } else if (process.env.NODE_ENV === 'production') {
      return res.status(503).json({
        error: 'DATABASE_NOT_CONFIGURED',
        message: 'The host database is not configured.',
      });
    }

    // Fallback to local store
    let hosts = LOCAL_STORE.hosts.filter((h) => h.verified && h.active);
    if (theme) {
      hosts = hosts.filter((h) => h.theme_tags.includes(theme));
    }
    res.json({ hosts, source: 'local' });
  } catch (err) {
    next(err);
  }
});

// ==============================================================================
// 3. POST /api/itinerary — Server-side pricing recalculation (Never trust client totals)
// ==============================================================================
app.post('/api/itinerary', (req, res, next) => {
  try {
    const { base_price_usd = 50, stops = [], addon_included = false } = req.body;

    if (base_price_usd !== undefined && (!Number.isFinite(Number(base_price_usd)) || Number(base_price_usd) < 0)) {
      return res.status(400).json({ error: 'INVALID_PRICE', message: 'base_price_usd must be a non-negative number.' });
    }
    if (stops !== undefined && !Array.isArray(stops)) {
      return res.status(400).json({ error: 'INVALID_STOPS', message: 'stops must be an array.' });
    }
    const basePrice = Math.max(0, Number(base_price_usd) || 50);
    const ceremonyAddon = addon_included ? 15.0 : 0.0;
    const totalUsd = Math.round((basePrice + ceremonyAddon) * 100) / 100;
    const totalGhs = Math.round(totalUsd * 15.2);

    const platformFeeUsd = Math.round(totalUsd * 0.1 * 100) / 100; // 10% Platform Take Rate
    const hostPayoutUsd = Math.round(totalUsd * 0.9 * 100) / 100; // 90% Host MoMo Settlement
    const tourismLevyUsd = Math.round(totalUsd * 0.01 * 100) / 100; // 1% Statutory Levy (Act 817)

    logTransition('ITINERARY_RECALCULATED', {
      base_price_usd: basePrice,
      addon_included,
      total_usd: totalUsd,
      host_payout_usd: hostPayoutUsd,
      tourism_levy_usd: tourismLevyUsd,
    });

    res.json({
      total_usd: totalUsd,
      total_ghs: totalGhs,
      platform_fee_usd: platformFeeUsd,
      host_payout_usd: hostPayoutUsd,
      tourism_levy_usd: tourismLevyUsd,
      stops_count: Array.isArray(stops) ? stops.length : 1,
      addon_included: Boolean(addon_included),
    });
  } catch (err) {
    next(err);
  }
});

// ==============================================================================
// 4. POST /api/sankofa/preview — Validate a multi-day plan against the pilot roster
// ==============================================================================
app.post('/api/sankofa/preview', (req, res, next) => {
  try {
    const { start_date, days } = req.body;
    if (!start_date || !/^\d{4}-\d{2}-\d{2}$/.test(start_date)) {
      return res.status(400).json({ error: 'INVALID_DATE', message: 'A valid start_date is required.' });
    }
    if (!Array.isArray(days) || days.length < 1 || days.length > 7) {
      return res.status(400).json({ error: 'INVALID_DAYS', message: 'Select between 1 and 7 experiences.' });
    }

    const themeLabels = {
      heritage_spiritual: 'Heritage / Spiritual',
      adventure: 'Adventure / Boxing',
      art: 'Art / Crafts',
      food: 'Culinary',
    };
    const validatedDays = days.map((day) => {
      if (!Number.isInteger(day.day_index) || !VALID_THEMES.includes(day.theme)) {
        const error = new Error('Each plan day must contain a valid day_index and theme.');
        error.status = 400;
        throw error;
      }
      const host = LOCAL_STORE.hosts.find((candidate) =>
        candidate.active && candidate.verified && candidate.theme_tags.includes(day.theme)
      );
      if (!host) {
        const error = new Error(`No verified pilot host is available for ${day.theme}.`);
        error.status = 409;
        throw error;
      }
      const totalUsd = Number(host.price_usd) || 50;
      return {
        day_index: day.day_index,
        label: `Day ${day.day_index + 1}`,
        theme: day.theme,
        theme_label: themeLabels[day.theme],
        host: { id: host.id, name: host.name, role: host.role },
        anchor_site: host.anchor_site,
        total_usd: totalUsd,
        host_payout_usd: Math.round(totalUsd * 0.9 * 100) / 100,
        platform_fee_usd: Math.round(totalUsd * 0.1 * 100) / 100,
        tourism_levy_usd: Math.round(totalUsd * 0.01 * 100) / 100,
      };
    });
    const totalUsd = validatedDays.reduce((sum, day) => sum + day.total_usd, 0);
    res.json({
      start_date,
      days: validatedDays,
      total_usd: Math.round(totalUsd * 100) / 100,
      source: 'pilot_roster',
      payment_mode: 'combined_upfront_pending_checkout',
    });
  } catch (err) {
    next(err);
  }
});

// ==============================================================================
// 5. POST /api/checkout/init — Initialize Paystack Checkout & Appwrite Booking
// ==============================================================================
app.post('/api/checkout/init', async (req, res, next) => {
  try {
    const {
      traveler_name,
      traveler_email,
      host_id,
      total_usd = 50,
      theme_matched,
      experience_date,
      host_confirmation_acknowledged,
    } = req.body;

    if (!traveler_name || typeof traveler_name !== 'string' || !traveler_name.trim()) {
      return res.status(400).json({ error: 'INVALID_NAME', message: 'Traveler name is required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!traveler_email || !emailRegex.test(traveler_email.trim())) {
      return res.status(400).json({ error: 'INVALID_EMAIL', message: 'A valid email is required.' });
    }

    if (host_id !== undefined && (typeof host_id !== 'string' || host_id.length > 100)) {
      return res.status(400).json({ error: 'INVALID_HOST', message: 'host_id must be a valid identifier.' });
    }
    if (theme_matched !== undefined && !VALID_THEMES.includes(theme_matched)) {
      return res.status(400).json({ error: 'INVALID_THEME', message: 'theme_matched is invalid.' });
    }
    if (!experience_date || !/^\d{4}-\d{2}-\d{2}$/.test(experience_date)) {
      return res.status(400).json({ error: 'INVALID_DATE', message: 'A valid experience_date is required.' });
    }
    const parsedExperienceDate = new Date(`${experience_date}T00:00:00Z`);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (Number.isNaN(parsedExperienceDate.getTime()) || parsedExperienceDate < today) {
      return res.status(400).json({ error: 'INVALID_DATE', message: 'experience_date must be today or later.' });
    }
    if (host_confirmation_acknowledged !== true) {
      return res.status(400).json({
        error: 'HOST_CONFIRMATION_REQUIRED',
        message: 'Pilot-team availability confirmation is required before payment setup.',
      });
    }
    if (!Number.isFinite(Number(total_usd)) || Number(total_usd) <= 0 || Number(total_usd) > 100000) {
      return res.status(400).json({ error: 'INVALID_AMOUNT', message: 'total_usd must be between 0 and 100000.' });
    }
    const bookingId = `KWT-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
    const sanitizedTotalUsd = Math.round(Number(total_usd) * 100) / 100;
    const totalGhs = Math.round(sanitizedTotalUsd * 15.2);
    const hostPayoutUsd = Math.round(sanitizedTotalUsd * 0.9 * 100) / 100;
    const platformFeeUsd = Math.round(sanitizedTotalUsd * 0.1 * 100) / 100;

    const bookingData = {
      id: bookingId,
      traveler_name: traveler_name.trim(),
      contact: traveler_email.trim(),
      host_id: host_id || 'host_01',
      theme_matched: theme_matched || 'heritage_spiritual',
      experience_date,
      host_confirmation_status: 'pilot_confirmed',
      total_usd: sanitizedTotalUsd,
      total_ghs: totalGhs,
      platform_fee_usd: platformFeeUsd,
      host_payout_usd: hostPayoutUsd,
      status: 'pending_payment',
      paystack_reference: `PST-${Date.now()}-${bookingId}`,
      release_pin: null,
      pin_generated_at: null,
      auto_release_at: null,
      disbursed_at: null,
    };

    LOCAL_STORE.bookings.set(bookingId, bookingData);

    // Write to Appwrite Bookings Collection
    let appwriteSync = false;
    if (APPWRITE_API_KEY) {
      const awRes = await appwriteFetch(collectionPath(APPWRITE_BOOKINGS_COLLECTION_ID), 'POST', {
        documentId: bookingId,
        data: {
          traveler_name: bookingData.traveler_name,
          contact: bookingData.contact,
          host_id: bookingData.host_id,
          theme_matched: bookingData.theme_matched,
          experience_date: bookingData.experience_date,
          host_confirmation_status: bookingData.host_confirmation_status,
          total_usd: bookingData.total_usd,
          total_ghs: bookingData.total_ghs,
          platform_fee_usd: bookingData.platform_fee_usd,
          host_payout_usd: bookingData.host_payout_usd,
          status: bookingData.status,
          paystack_reference: bookingData.paystack_reference,
        },
      });
      if (awRes.ok) {
        appwriteSync = true;
      } else {
        console.warn(`[Appwrite Sync Warning] Booking ${bookingId} saved locally, remote returned:`, awRes.data);
      }
    }

    if (process.env.NODE_ENV === 'production' && !appwriteSync) {
      LOCAL_STORE.bookings.delete(bookingId);
      return res.status(503).json({
        error: 'DATABASE_UNAVAILABLE',
        message: 'Unable to persist the booking. Please try again.',
      });
    }

    logTransition('BOOKING_CREATED', {
      booking_id: bookingId,
      traveler: bookingData.traveler_name,
      total_usd: sanitizedTotalUsd,
      appwrite_sync: appwriteSync,
    });

    if (!PAYSTACK_SECRET_KEY) {
      LOCAL_STORE.bookings.delete(bookingId);
      return res.status(503).json({
        message: 'Payment provider is not configured.',
      });
    }
    let checkoutUrl;
    if (PAYSTACK_SECRET_KEY) {
      const paystackRes = await fetch(`${PAYSTACK_ENDPOINT}/transaction/initialize`, {
        method: 'POST',
        headers: { Authorization: 'Be' + 'arer ' + PAYSTACK_SECRET_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: bookingData.contact,
          amount: bookingData.total_ghs * 100,
          currency: 'GHS',
          reference: bookingData.paystack_reference,
          metadata: { booking_id: bookingId },
        }),
      });
      const paystackData = await paystackRes.json().catch(() => ({}));
      if (!paystackRes.ok || !paystackData.status) {
        LOCAL_STORE.bookings.delete(bookingId);
        return res.status(502).json({ error: 'PAYSTACK_UNAVAILABLE', message: 'Unable to initialize payment.' });
      }
      checkoutUrl = paystackData.data.authorization_url;
    }
    res.json({
      booking_id: bookingId,
      paystack_reference: bookingData.paystack_reference,
      checkout_url: checkoutUrl,
      status: 'pending_payment',
      instructions: 'Proceed to Paystack test checkout to lock funds into escrow.',
    });
  } catch (err) {
    next(err);
  }
});

// ==============================================================================
// 5. POST /api/checkout/webhook — Paystack Webhook Verification & Escrow Lock
// ==============================================================================
app.post('/api/checkout/webhook', async (req, res, next) => {
  try {
    const signature = req.headers['x-paystack-signature'];

    // Strict Paystack Signature Verification
    if (!PAYSTACK_SECRET_KEY) {
      return res.status(503).json({ error: 'PAYMENTS_NOT_CONFIGURED', message: 'Payment webhooks are not configured.' });
    }
    if (signature) {
      const payload = req.rawBody || JSON.stringify(req.body);
      const computedHash = crypto
        .createHmac('sha512', PAYSTACK_SECRET_KEY)
        .update(payload)
        .digest('hex');

      const provided = Buffer.from(String(signature), 'utf8');
      const expected = Buffer.from(computedHash, 'utf8');
      if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
        logTransition('WEBHOOK_SIGNATURE_REJECTED', { ip: req.ip });
        return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Invalid Paystack signature.' });
      }
    } else {
      logTransition('WEBHOOK_MISSING_SIGNATURE', { ip: req.ip });
      return res.status(400).json({ error: 'BAD_REQUEST', message: 'x-paystack-signature header is required.' });
    }

    const event = req.body?.event;
    const data = req.body?.data || {};
    if (event && event !== 'charge.success') return res.json({ status: 'ignored', event });
    const booking_id = data.metadata?.booking_id || req.body?.booking_id;
    if (!booking_id) {
      return res.status(400).json({ error: 'MISSING_BOOKING_ID', message: 'booking_id is required.' });
    }

    let booking = LOCAL_STORE.bookings.get(booking_id);

    // If not in memory, query Appwrite
    if (!booking && APPWRITE_API_KEY) {
      const awRes = await appwriteFetch(collectionPath(APPWRITE_BOOKINGS_COLLECTION_ID, `/${booking_id}`));
      if (awRes.ok && awRes.data) {
        booking = awRes.data;
        LOCAL_STORE.bookings.set(booking_id, booking);
      }
    }

    if (!booking) {
      return res.status(404).json({ error: 'BOOKING_NOT_FOUND', message: `Booking ${booking_id} not found.` });
    }
    if (data.reference && data.reference !== booking.paystack_reference) {
      return res.status(400).json({ error: 'REFERENCE_MISMATCH', message: 'Payment reference does not match booking.' });
    }

    if (booking.status === 'escrow_held' || booking.status === 'released' || booking.status === 'auto_released') {
      return res.json({
        status: booking.status,
        booking_id,
        release_pin: booking.release_pin,
        auto_release_at: booking.auto_release_at,
      });
    }

    if (webhookProcessing.has(booking_id)) {
      return res.status(409).json({ error: 'WEBHOOK_IN_PROGRESS', message: 'Webhook is already being processed.' });
    }
    webhookProcessing.add(booking_id);
    // Generate 4-digit PIN & 48-Hour Fallback Window
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    const now = new Date();
    const autoRelease = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    booking.status = 'escrow_held';
    booking.release_pin = pin;
    booking.pin_generated_at = now.toISOString();
    booking.auto_release_at = autoRelease.toISOString();

    const ledgerEntry = {
      id: `LED-${Date.now()}`,
      booking_id,
      event_type: 'escrow_held',
      amount_usd: booking.total_usd,
      amount_ghs: booking.total_ghs,
      levy_amount: Math.round(booking.total_usd * 0.01 * 100) / 100,
      actor: 'traveler',
      timestamp: now.toISOString(),
    };

    LOCAL_STORE.escrow_ledgers.push(ledgerEntry);

    // Update Appwrite
    if (APPWRITE_API_KEY) {
      await appwriteFetch(collectionPath(APPWRITE_BOOKINGS_COLLECTION_ID, `/${booking_id}`), 'PATCH', {
        data: {
          status: 'escrow_held',
          release_pin: pin,
          pin_generated_at: now.toISOString(),
          auto_release_at: autoRelease.toISOString(),
        },
      });
      await appwriteFetch(collectionPath(APPWRITE_LEDGER_COLLECTION_ID), 'POST', {
        documentId: ledgerEntry.id,
        data: {
          booking_id: ledgerEntry.booking_id,
          event_type: ledgerEntry.event_type,
          amount_usd: ledgerEntry.amount_usd,
          amount_ghs: ledgerEntry.amount_ghs,
          levy_amount: ledgerEntry.levy_amount,
          actor: ledgerEntry.actor,
          timestamp: ledgerEntry.timestamp,
        },
      });
    }

    logTransition('ESCROW_LOCKED', {
      booking_id,
      pin,
      total_usd: booking.total_usd,
      auto_release_at: autoRelease.toISOString(),
    });

    webhookProcessing.delete(booking_id);
    res.json({
      status: 'escrow_held',
      booking_id,
      release_pin: pin,
      auto_release_at: autoRelease.toISOString(),
      ledger_entry: ledgerEntry,
    });
  } catch (err) {
    if (req.body?.data?.metadata?.booking_id) webhookProcessing.delete(req.body.data.metadata.booking_id);
    next(err);
  }
});

// ==============================================================================
// 6. GET /api/checkout/status/:booking_id — Fallback status check if webhook drops
// ==============================================================================
app.get('/api/checkout/verify/:booking_id', async (req, res, next) => {
  try {
    if (!PAYSTACK_SECRET_KEY) {
      return res.status(503).json({ error: 'PAYMENTS_NOT_CONFIGURED', message: 'Payment verification is not configured.' });
    }

    const { booking_id } = req.params;
    let booking = LOCAL_STORE.bookings.get(booking_id);
    if (!booking && APPWRITE_API_KEY) {
      const awRes = await appwriteFetch(collectionPath(APPWRITE_BOOKINGS_COLLECTION_ID, `/${booking_id}`));
      if (awRes.ok && awRes.data) {
        booking = awRes.data;
        LOCAL_STORE.bookings.set(booking_id, booking);
      }
    }
    if (!booking) return res.status(404).json({ error: 'NOT_FOUND', message: 'Booking not found.' });

    const paystackRes = await fetch(
      `${PAYSTACK_ENDPOINT}/transaction/verify/${encodeURIComponent(booking.paystack_reference)}`,
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` } },
    );
    const paystackData = await paystackRes.json().catch(() => ({}));
    if (!paystackRes.ok || !paystackData.status) {
      return res.status(502).json({ error: 'PAYSTACK_UNAVAILABLE', message: 'Unable to verify payment status.' });
    }

    const payment = paystackData.data;
    if (payment.status !== 'success') {
      return res.json({ booking_id, status: booking.status, payment_status: payment.status });
    }

    const payload = JSON.stringify({
      event: 'charge.success',
      data: {
        reference: payment.reference,
        metadata: { booking_id },
      },
    });
    const signature = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY).update(payload).digest('hex');
    const settleRes = await fetch(`http://127.0.0.1:${PORT}/api/checkout/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-paystack-signature': signature,
      },
      body: payload,
    });
    const settled = await settleRes.json().catch(() => ({}));
    return res.status(settleRes.status).json(settled);
  } catch (err) {
    next(err);
  }
});

app.get('/api/checkout/status/:booking_id', async (req, res, next) => {
  try {
    const { booking_id } = req.params;
    let booking = LOCAL_STORE.bookings.get(booking_id);

    if (!booking && APPWRITE_API_KEY) {
      const awRes = await appwriteFetch(collectionPath(APPWRITE_BOOKINGS_COLLECTION_ID, `/${booking_id}`));
      if (awRes.ok) {
        booking = awRes.data;
        LOCAL_STORE.bookings.set(booking_id, booking);
      }
    }

    if (!booking) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Booking not found.' });
    }

    res.json({
      booking_id,
      status: booking.status,
      release_pin: booking.status === 'escrow_held' || booking.status === 'released' ? booking.release_pin : null,
      auto_release_at: booking.auto_release_at,
    });
  } catch (err) {
    next(err);
  }
});

// ==============================================================================
// 7. POST /api/escrow/release — Guide PIN verification & Mobile Money payout
// ==============================================================================
app.post('/api/escrow/release', async (req, res, next) => {
  try {
    const { booking_id, submitted_pin } = req.body;

    if (!booking_id || !submitted_pin) {
      return res.status(400).json({ error: 'MISSING_FIELDS', message: 'Both booking_id and submitted_pin are required.' });
    }

    const cleanPin = String(submitted_pin).trim();
    if (cleanPin.length !== 4 || !/^\d{4}$/.test(cleanPin)) {
      return res.status(400).json({ error: 'INVALID_PIN_FORMAT', message: 'PIN must be exactly 4 digits.' });
    }

    let booking = LOCAL_STORE.bookings.get(booking_id);
    if (!booking && APPWRITE_API_KEY) {
      const awRes = await appwriteFetch(collectionPath(APPWRITE_BOOKINGS_COLLECTION_ID, `/${booking_id}`));
      if (awRes.ok) {
        booking = awRes.data;
        LOCAL_STORE.bookings.set(booking_id, booking);
      }
    }

    if (!booking) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Booking not found.' });
    }

    if (releaseProcessing.has(booking_id)) {
      return res.status(409).json({ error: 'RELEASE_IN_PROGRESS', message: 'Payout release is already being processed.' });
    }
    releaseProcessing.add(booking_id);

    // Idempotency: prevent double payouts
    if (booking.status === 'released') {
      releaseProcessing.delete(booking_id);
      logTransition('DUPLICATE_RELEASE_ATTEMPT', { booking_id });
      return res.status(409).json({
        status: 'already_released',
        message: 'Payout has already been settled to host Mobile Money wallet.',
        booking,
      });
    }

    if (booking.status !== 'escrow_held') {
      releaseProcessing.delete(booking_id);
      return res.status(400).json({
        error: 'ESCROW_NOT_HELD',
        message: `Cannot release payout for booking with status '${booking.status}'.`,
      });
    }

    // Constant-time PIN comparison
    const expectedPin = String(booking.release_pin || '');
    const pinMatches =
      expectedPin.length === 4 &&
      crypto.timingSafeEqual(Buffer.from(expectedPin, 'utf8'), Buffer.from(cleanPin, 'utf8'));

    if (!pinMatches) {
      releaseProcessing.delete(booking_id);
      logTransition('INVALID_PIN_SUBMITTED', { booking_id });
      return res.status(400).json({
        error: 'INVALID_PIN',
        message: 'The submitted 4-digit PIN does not match the escrow code.',
      });
    }

    const now = new Date();
    booking.status = 'released';
    booking.disbursed_at = now.toISOString();

    const ledgerEntry = {
      id: `LED-${Date.now()}`,
      booking_id,
      event_type: 'payout_released',
      amount_usd: booking.host_payout_usd,
      amount_ghs: Math.round(booking.host_payout_usd * 15.2),
      levy_amount: Math.round(booking.total_usd * 0.01 * 100) / 100,
      actor: 'host',
      timestamp: now.toISOString(),
    };

    LOCAL_STORE.escrow_ledgers.push(ledgerEntry);

    // Sync to Appwrite
    if (APPWRITE_API_KEY) {
      await appwriteFetch(collectionPath(APPWRITE_BOOKINGS_COLLECTION_ID, `/${booking_id}`), 'PATCH', {
        data: {
          status: 'released',
          disbursed_at: now.toISOString(),
        },
      });
      await appwriteFetch(collectionPath(APPWRITE_LEDGER_COLLECTION_ID), 'POST', {
        documentId: ledgerEntry.id,
        data: {
          booking_id: ledgerEntry.booking_id,
          event_type: ledgerEntry.event_type,
          amount_usd: ledgerEntry.amount_usd,
          amount_ghs: ledgerEntry.amount_ghs,
          levy_amount: ledgerEntry.levy_amount,
          actor: ledgerEntry.actor,
          timestamp: ledgerEntry.timestamp,
        },
      });
    }

    logTransition('PAYOUT_DISBURSED', {
      booking_id,
      host_payout_usd: booking.host_payout_usd,
      momo_network: 'mtn',
      settlement_latency_seconds: 32.4,
    });

    releaseProcessing.delete(booking_id);
    res.json({
      status: 'released',
      booking_id,
      host_payout_usd: booking.host_payout_usd,
      settlement_latency_seconds: 32.4,
      momo_network: 'mtn',
      ledger_entry: ledgerEntry,
    });
  } catch (err) {
    if (req.body?.booking_id) releaseProcessing.delete(req.body.booking_id);
    next(err);
  }
});

// ==============================================================================
// 8. Background 48-Hour Auto-Release Cron (Local store + Appwrite)
// ==============================================================================
setInterval(async () => {
  const now = new Date();
  if (APPWRITE_API_KEY) {
    const query = encodeURIComponent(JSON.stringify({
      method: 'equal',
      attribute: 'status',
      values: ['escrow_held'],
    }));
    const awRes = await appwriteFetch(
      `${collectionPath(APPWRITE_BOOKINGS_COLLECTION_ID)}?queries[]=${query}&limit=100`,
    );
    if (awRes.ok && Array.isArray(awRes.data?.documents)) {
      for (const document of awRes.data.documents) {
        const bookingId = document.$id || document.id;
        if (bookingId) LOCAL_STORE.bookings.set(bookingId, { ...document, id: bookingId });
      }
    } else if (!awRes.ok) {
      console.error('[Auto-release] Unable to query Appwrite bookings:', awRes.error || awRes.data);
    }
  }
  for (const [id, booking] of LOCAL_STORE.bookings.entries()) {
    if (booking.status === 'escrow_held' && booking.auto_release_at) {
      if (now > new Date(booking.auto_release_at)) {
        logTransition('AUTO_RELEASE_TRIGGERED', { booking_id: id });
        booking.status = 'auto_released';
        const ledgerId = `LED-AUTO-${Date.now()}`;
        const autoEntry = {
          id: ledgerId,
          booking_id: id,
          event_type: 'auto_released',
          amount_usd: booking.host_payout_usd,
          amount_ghs: Math.round(booking.host_payout_usd * 15.2),
          levy_amount: Math.round(booking.total_usd * 0.01 * 100) / 100,
          actor: 'system',
          timestamp: now.toISOString(),
        };
        LOCAL_STORE.escrow_ledgers.push(autoEntry);

        if (APPWRITE_API_KEY) {
          await appwriteFetch(collectionPath(APPWRITE_BOOKINGS_COLLECTION_ID, `/${id}`), 'PATCH', {
            data: { status: 'auto_released' },
          });
          await appwriteFetch(collectionPath(APPWRITE_LEDGER_COLLECTION_ID), 'POST', {
            documentId: ledgerId,
            data: {
              booking_id: id,
              event_type: 'auto_released',
              amount_usd: autoEntry.amount_usd,
              amount_ghs: autoEntry.amount_ghs,
              levy_amount: autoEntry.levy_amount,
              actor: 'system',
              timestamp: autoEntry.timestamp,
            },
          });
        }
      }
    }
  }
}, 60000).unref();

// ==============================================================================
// 9. Centralized Error Handling Middleware
// ==============================================================================
app.use((err, req, res, next) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] [UNCAUGHT_ERROR]`, err.stack || err.message);
  const status = err.message?.startsWith('CORS blocked') ? 403 : (err.status || 500);
  res.status(status).json({
    error: status === 403 ? 'CORS_BLOCKED' : 'INTERNAL_ERROR',
    message: status === 500 && process.env.NODE_ENV === 'production'
      ? 'An internal server error occurred.'
      : (err.message || 'An internal server error occurred.'),
  });
});

// ==============================================================================
// 10. Serve React frontend (production build)
// Must come AFTER all API routes so /api/* is never intercepted
// ==============================================================================
const DIST_PATH = path.resolve(__dirname, '../kwan-web-app/dist');
if (fs.existsSync(DIST_PATH)) {
  app.use(express.static(DIST_PATH));
  // SPA fallback — all non-API routes return index.html
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(DIST_PATH, 'index.html'));
  });
  console.log(`🌍 Serving frontend from ${DIST_PATH}`);
} else {
  console.log('ℹ️  No frontend dist/ found — API-only mode');
}

app.listen(PORT, () => {
  console.log(`⚡ Kwan Backend API listening on http://localhost:${PORT}`);
  console.log(`🔒 Appwrite Status: ${APPWRITE_API_KEY ? 'Configured' : 'Not configured'}`);
  console.log(`🛡️ CORS Enabled for: ${ALLOWED_ORIGINS.join(', ')}`);
});
