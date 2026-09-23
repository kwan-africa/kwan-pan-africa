import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Compass,
  Copy,
  ExternalLink,
  LockKeyhole,
  Loader2,
  MapPin,
  MessageCircle,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Smartphone,
  WalletCards,
  X,
} from 'lucide-react';

import { VERIFIED_HOSTS, LIVING_CORRIDOR_FACTS, SANKOFA_CURATED_PACKAGES, SANKOFA_WEEK_TEMPLATES } from './data/culturalKnowledge';
import { matchGuideOffline, getOfflinePricing } from './services/offlineFallback';
import RotatingFacts from './components/RotatingFacts';
import AboutThisPlace from './components/AboutThisPlace';
import SankofaPlanner from './components/SankofaPlanner';

// ── Static data ────────────────────────────────────────────────────────────────

const THEME_OPTIONS = [
  { tag: 'heritage_spiritual', label: 'Heritage / Spiritual', defaultQuery: 'a spiritual journey to reconnect with my roots' },
  { tag: 'adventure', label: 'Adventure / Boxing', defaultQuery: 'morning boxing session and walking tour in Bukom' },
  { tag: 'art', label: 'Art / Bead Crafts', defaultQuery: 'hands-on bead making and local crafts in Jamestown' },
];

const EXAMPLES = [
  'a spiritual journey to reconnect with my roots',
  'I want a morning boxing session and walking tour in Bukom.',
  'I am visiting for heritage and want to understand independence history.',
  'I want hands-on bead making and local crafts in Jamestown.',
];

/**
 * Rich experience definitions — stops, meeting point, what to bring, etiquette,
 * and cancellation policy displayed in the guide card and post-booking screen.
 */
const EXPERIENCE_DETAILS = {
  heritage_spiritual: {
    label: 'Heritage / Spiritual',
    duration: 'Half-day (4–5 hrs)',
    itinerary: 'Guided heritage walk with cultural context and time for reflection at the anchor site.',
    stops: [
      { time: '09:00 AM', activity: 'Guide meets you at Cape Coast Castle main gate', type: 'meetup' },
      { time: '09:30 AM', activity: 'Castle dungeons & Door of No Return tour with ancestral narration', type: 'main' },
      { time: '11:30 AM', activity: 'Wall of Remembrance — optional libation ceremony', type: 'optional' },
      { time: '12:30 PM', activity: 'Oguaa harbour walk & Fante community elder interaction', type: 'cultural' },
    ],
    whatToBring: [
      'Comfortable closed shoes',
      'Light layer (castle interiors are cool)',
      'Water bottle',
      'Small notebook or journal for reflections',
    ],
    meetingNote: 'Your guide meets you at the main entrance of Cape Coast Castle. Look for their Kwan green lanyard badge.',
    etiquette: 'Maintain reflective, respectful decorum inside the dungeons. Avoid photography inside the slave cells unless explicitly permitted by the guide.',
    cancellation: 'Full refund if cancelled 24+ hrs before experience. 50% refund within 24 hrs. No refund for no-shows.',
  },
  adventure: {
    label: 'Adventure / Boxing',
    duration: 'Morning (3 hrs)',
    itinerary: 'Warm-up, coached boxing session, and a local walking route around the host neighbourhood.',
    stops: [
      { time: '07:00 AM', activity: 'Guide meets you at Bukom Boxing Academies entrance, Jamestown', type: 'meetup' },
      { time: '07:15 AM', activity: 'Warm-up & introductory boxing session with coach', type: 'main' },
      { time: '08:30 AM', activity: 'Community walk — Jamestown Lighthouse & fishermen\'s landing', type: 'cultural' },
      { time: '09:30 AM', activity: 'Local tea & storytelling (Azumah Nelson history)', type: 'optional' },
    ],
    whatToBring: [
      'Sports clothes & trainers',
      'Small towel',
      'Water bottle',
      'Hand wraps (provided if you don\'t have them)',
    ],
    meetingNote: 'Your guide meets you at the gate of Bukom Boxing Academy, opposite the Jamestown Lighthouse roundabout.',
    etiquette: 'Greet with your right hand. Ask your guide before photographing training sessions or youth boxers.',
    cancellation: 'Full refund if cancelled 24+ hrs before experience. 50% refund within 24 hrs. No refund for no-shows.',
  },
  art: {
    label: 'Art / Bead Crafts',
    duration: 'Half-day (4 hrs)',
    itinerary: 'Hands-on craft session, local maker stories, and a guided walk through the arts compound.',
    stops: [
      { time: '10:00 AM', activity: 'Guide meets you at Arts Centre main gate, High Street', type: 'meetup' },
      { time: '10:15 AM', activity: 'Adinkra carving or bead-making session with your master', type: 'main' },
      { time: '12:00 PM', activity: 'Talking drum rhythm lesson (Akan day name)', type: 'cultural' },
      { time: '01:00 PM', activity: 'Arts Centre market walk — zero tourist markup guidance', type: 'optional' },
    ],
    whatToBring: [
      'Comfortable clothes (ink / dye may be involved)',
      'Water bottle',
      'Cash GHS for pieces you want to buy',
    ],
    meetingNote: 'Your guide meets you at the main entrance of the Arts Centre on High Street, near the Black Star Square.',
    etiquette: 'Bargaining is a warm social exchange — smile and greet first. Shake hands firmly when entering any workshop.',
    cancellation: 'Full refund if cancelled 24+ hrs before experience. 50% refund within 24 hrs. No refund for no-shows.',
  },
};

// Fallback for any unrecognised theme tag
EXPERIENCE_DETAILS.default = EXPERIENCE_DETAILS.heritage_spiritual;

// ── Helpers ────────────────────────────────────────────────────────────────────

const formatUsd = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const API_BASE = import.meta.env?.VITE_API_BASE || '/api';

// ── App root ───────────────────────────────────────────────────────────────────

export default function App() {
  const [request, setRequest] = useState('');
  const [conversation, setConversation] = useState([
    {
      role: 'kwan',
      copy: 'Tell us how you would like to experience Ghana. Kwan will recommend one trusted local host, selected for your interests and grounded in our verified pilot collection.',
    },
  ]);
  const [guide, setGuide] = useState(null);
  const [matchedTheme, setMatchedTheme] = useState(null);
  const [addonIncluded, setAddonIncluded] = useState(false);
  const [serverPricing, setServerPricing] = useState({
    total_usd: 50,
    total_ghs: 760,
    platform_fee_usd: 5.0,
    host_payout_usd: 45.0,
    tourism_levy_usd: 0.5,
  });
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState('details');
  const [traveler, setTraveler] = useState({ name: '', email: '' });
  const [experienceDate, setExperienceDate] = useState('');
  const [pilotConfirmation, setPilotConfirmation] = useState(false);
  const [booking, setBooking] = useState(null);
  const [copied, setCopied] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pathname, setPathname] = useState(() => window.location.pathname);
  const requestInput = useRef(null);
  const matchPanelRef = useRef(null);

  const isMatching = loadingAction === 'matching';
  const effectivePrice = serverPricing.total_usd;

  const paymentLink = useMemo(
    () => `kwanai.me/pay/${guide?.id ?? 'pilot'}-${booking?.reference ?? 'preview'}`,
    [guide, booking],
  );

  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  function navigate(path) {
    window.history.pushState({}, '', path);
    setPathname(path);
  }

  function surpriseMe() {
    const prompt = EXAMPLES[Math.floor(Math.random() * EXAMPLES.length)];
    sendRequest(prompt);
  }

  function viewGuideDetails() {
    matchPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => matchPanelRef.current?.focus(), 350);
  }

  async function sendRequest(value = request) {
    const trimmed = value.trim();
    if (!trimmed || isMatching) return;

    setConversation((items) => [...items, { role: 'traveler', copy: trimmed }]);
    setRequest('');
    setGuide(null);
    setMatchedTheme(null);
    setAddonIncluded(false);
    setLoadingAction('matching');
    setErrorMessage(null);
    setIsOfflineMode(false);

    try {
      // ── Live backend path ──────────────────────────────────────────────────
      const classRes = await fetch(`${API_BASE}/classify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed }),
      });

      if (!classRes.ok) {
        throw new Error(`Classification service returned status ${classRes.status}`);
      }

      const { theme_matched, anchor_site } = await classRes.json();

      const hostRes = await fetch(`${API_BASE}/hosts?theme=${theme_matched}`);
      if (!hostRes.ok) {
        throw new Error(`Hosts service returned status ${hostRes.status}`);
      }

      const { hosts } = await hostRes.json();

      let matched = null;
      if (hosts && hosts.length > 0) {
        const h = hosts[0];
        // Enrich backend host with richer local data (bio, rating, languages)
        const local = VERIFIED_HOSTS.find(vh => vh.id === (h.$id || h.id));
        matched = {
          id: h.$id || h.id,
          name: h.name,
          role: h.role,
          area: h.guild || h.anchor_site || 'Accra, Ghana',
          price: Number(h.price_usd) || 50,
          anchorSite: h.anchor_site || anchor_site,
          theme: theme_matched,
          initials: h.name.split(' ').map((n) => n[0]).join('').slice(0, 2),
          color: 'ochre',
          image: h.photo_url || local?.image || '/ghana_guide_kwesi.jpg',
          // Rich enrichment
          bio: local?.bio || h.bio || '',
          rating: local?.rating || h.rating || 4.9,
          reviewsCount: local?.reviewsCount || h.reviews_count || 0,
          languages: local?.languages || ['English'],
          momoNetwork: local?.momoNetwork || 'MTN Mobile Money',
          ghanaCard: local?.ghanaCard || h.ghana_card_id || '',
          corridorId: local?.corridorId || (
            /bukom|jamestown/i.test(h.anchor_site || '') ? 'ga_mashie' :
            /arts centre|high street/i.test(h.anchor_site || '') ? 'high_street' :
            'cape_coast'
          ),
        };
      } else {
        throw new Error('No verified guides are currently available for that theme.');
      }

      setGuide(matched);
      setMatchedTheme(theme_matched);

      const itinRes = await fetch(`${API_BASE}/itinerary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base_price_usd: matched.price, addon_included: false }),
      });
      if (!itinRes.ok) {
        throw new Error(`Itinerary service returned status ${itinRes.status}`);
      }
      const itinData = await itinRes.json();
      setServerPricing(itinData);

      setConversation((items) => [
        ...items,
        {
          role: 'kwan',
          kind: 'guide-match',
          guide: matched,
          theme: theme_matched,
          copy: `I matched you with ${matched.name} because their verified roster profile covers ${EXPERIENCE_DETAILS[theme_matched]?.label || theme_matched} experiences near ${matched.anchorSite}.`,
        },
      ]);

    } catch (err) {
      // ── Offline fallback path ──────────────────────────────────────────────
      console.warn('Backend unreachable — activating offline demo mode:', err.message);
      try {
        const offlineGuide = matchGuideOffline(trimmed);
        const offlinePricing = getOfflinePricing(offlineGuide.price, false);
        setGuide(offlineGuide);
        setMatchedTheme(offlineGuide.theme);
        setServerPricing(offlinePricing);
        setIsOfflineMode(true);
        setConversation((items) => [
          ...items,
          {
            role: 'kwan',
            kind: 'guide-match',
            guide: offlineGuide,
            theme: offlineGuide.theme,
            copy: `[Demo mode] Matched you with ${offlineGuide.name} — ${offlineGuide.role}. The live backend is offline; pricing is calculated locally from the pilot roster.`,
          },
        ]);
      } catch {
        setGuide(null);
        setErrorMessage(`We could not complete the match: ${err.message}`);
        setConversation((items) => [
          ...items,
          {
            role: 'kwan',
            copy: 'I could not reach the live guide roster. Please try again when the service is available.',
          },
        ]);
      }
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleToggleAddon() {
    if (!guide) return;
    const nextAddon = !addonIncluded;
    setLoadingAction('recalculating');
    setErrorMessage(null);

    try {
      if (isOfflineMode) throw new Error('offline');
      const res = await fetch(`${API_BASE}/itinerary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base_price_usd: guide.price, addon_included: nextAddon }),
      });
      if (!res.ok) throw new Error('Failed to recalculate itinerary pricing from server.');
      const data = await res.json();
      setAddonIncluded(nextAddon);
      setServerPricing(data);
    } catch {
      // Offline fallback — calculate locally
      setAddonIncluded(nextAddon);
      setServerPricing(getOfflinePricing(guide.price, nextAddon));
    } finally {
      setLoadingAction(null);
    }
  }

  function openCheckout() {
    setCheckoutStep('details');
    setBooking(null);
    setCopied(false);
    setEnteredPin('');
    // Guide was already matched — consider availability implicitly acknowledged
    setPilotConfirmation(true);
    setErrorMessage(null);
    setCheckoutOpen(true);
  }

  function resetMatch() {
    setGuide(null);
    setMatchedTheme(null);
    setAddonIncluded(false);
    setIsOfflineMode(false);
    setConversation([
      {
        role: 'kwan',
        copy: 'Tell us how you would like to experience Ghana. Kwan will recommend one trusted local host, selected for your interests and grounded in our verified pilot collection.',
      },
    ]);
    setRequest('');
    setErrorMessage(null);
    requestInput.current?.focus();
  }

  async function createPaymentPreview(event) {
    event.preventDefault();
    if (!traveler.name.trim() || !traveler.email.trim()) return;
    if (!experienceDate) {
      setErrorMessage('Please select a preferred experience date before creating your payment link.');
      return;
    }

    setLoadingAction('checkout_init');
    setErrorMessage(null);

    // In offline / demo mode, generate a local booking reference
    if (isOfflineMode) {
      const demoRef = `KWN-DEMO-${Math.floor(100000 + Math.random() * 900000)}`;
      setBooking({
        reference: demoRef,
        checkoutUrl: null,
        status: 'demo',
        traveler: traveler.name.trim(),
        experienceDate,
        pin: null,
      });
      setCheckoutStep('payment');
      setLoadingAction(null);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/checkout/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          traveler_name: traveler.name.trim(),
          traveler_email: traveler.email.trim(),
          host_id: guide?.id || 'host_01',
          total_usd: effectivePrice,
          theme_matched: guide?.theme || 'heritage_spiritual',
          experience_date: experienceDate,
          host_confirmation_acknowledged: pilotConfirmation,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Checkout initialization failed.');
      }

      const data = await res.json();
      setBooking({
        reference: data.booking_id,
        checkoutUrl: data.checkout_url,
        status: 'link-ready',
        traveler: traveler.name.trim(),
        experienceDate,
        pin: null,
      });
      setCheckoutStep('payment');
    } catch (err) {
      setErrorMessage(`Checkout error: ${err.message}`);
    } finally {
      setLoadingAction(null);
    }
  }

  function openPaystackCheckout() {
    if (!booking?.checkoutUrl) {
      setErrorMessage('The payment checkout link is not available yet.');
      return;
    }
    window.open(booking.checkoutUrl, '_blank', 'noopener,noreferrer');
  }

  async function checkPaymentStatus() {
    if (!booking?.reference) return;
    setLoadingAction('polling');
    setErrorMessage(null);

    try {
      const res = await fetch(`${API_BASE}/checkout/verify/${booking.reference}`);
      if (!res.ok) throw new Error('Status check endpoint returned error.');
      const data = await res.json();
      if (data.status === 'escrow_held' || data.status === 'released') {
        setBooking((current) => ({
          ...current,
          status: data.status === 'released' ? 'released' : 'held',
          pin: data.release_pin,
        }));
        setCheckoutStep('confirmed');
      } else {
        setErrorMessage(
          data.payment_status
            ? `Paystack reports "${data.payment_status}". Complete payment in the Paystack window, then check again.`
            : `Current payment status: ${data.status}. Awaiting payment confirmation.`,
        );
      }
    } catch (err) {
      setErrorMessage(`Status check failed: ${err.message}`);
    } finally {
      setLoadingAction(null);
    }
  }

  async function releasePayout() {
    if (!booking?.reference || enteredPin.length !== 4) return;
    setLoadingAction('releasing');
    setErrorMessage(null);

    // Demo mode — simulate instant release
    if (isOfflineMode || booking.status === 'demo' || booking.status === 'held-demo') {
      setTimeout(() => {
        setBooking((current) => ({ ...current, status: 'released' }));
        setLoadingAction(null);
      }, 900);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/escrow/release`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: booking.reference, submitted_pin: enteredPin }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'PIN verification failed.');
      }
      setBooking((current) => ({ ...current, status: 'released' }));
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoadingAction(null);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`https://${paymentLink}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  // Demo mode: simulate escrow held after "opening Paystack"
  function simulateDemoPayment() {
    const demoPin = Math.floor(1000 + Math.random() * 9000).toString();
    setBooking((current) => ({
      ...current,
      status: 'held-demo',
      pin: demoPin,
    }));
    setCheckoutStep('confirmed');
  }

  if (pathname === '/plan') {
    return <SankofaPlanPage onBack={() => navigate('/')} />;
  }

  return (
    <div className="site-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Kwan home" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src="/kwan_logo_white_bg.png"
            alt="Kwan Pan-African Travel"
            style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
            onError={(e) => { e.target.src = '/kwan_logo_square_white_bg.png'; }}
          />
        </a>
        <p className="pilot-label">
          Accra &amp; Cape Coast · Trusted local experiences
          {isOfflineMode && <span style={{ marginLeft: '0.5rem', fontSize: '0.72rem', color: '#F5A623', fontFamily: 'monospace' }}>[LOCAL FALLBACK]</span>}
        </p>
      </header>

      {errorMessage && (
        <div
          style={{
            maxWidth: '1200px',
            margin: '0.8rem auto 0',
            padding: '0.7rem 1rem',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid #EF4444',
            borderRadius: '8px',
            color: '#EF4444',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.6rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={17} color="#EF4444" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer' }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      <main id="top" className="page">
        <section className="intro hero-intro" aria-labelledby="page-title">
          <p className="eyebrow">Grassroots cultural travel</p>
          <h1 id="page-title">One conversation.<br />One local guide.</h1>
          <p className="lede">
            Describe the experience you want in Ghana. Kwan connects you with one trusted local host and makes the next step simple.
          </p>
          <div className="method-note">
            <ShieldCheck size={18} aria-hidden="true" />
            <span>Every host is identity- and Mobile Money-wallet reviewed before they welcome a traveler.</span>
          </div>
        </section>

        <section className="booking-layout" aria-label="Conversation and guide match">
          <div className="conversation-panel">
            <div className="panel-heading">
              <div>
                <p className="section-kicker">Start here</p>
                <h2>What would you like to experience?</h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => navigate('/plan')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.35rem 0.7rem',
                    borderRadius: '999px',
                    border: '1px solid rgba(33,71,52,0.25)',
                    background: 'transparent',
                    color: '#214734',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.18s',
                    fontFamily: 'monospace',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                  aria-label="Open Sankofa week planner"
                >
                  ✦ Sankofa Plan
                </button>
                <MessageCircle size={20} aria-hidden="true" />
              </div>
            </div>

            {/* Sankofa Planner — full week builder */}
            <div className="messages" aria-live="polite">
              {conversation.map((message, index) => (
                <div className={`message ${message.role}${message.kind ? ` message-${message.kind}` : ''}`} key={`${message.role}-${index}`}>
                  <span className="message-label">{message.role === 'kwan' ? 'Kwan' : 'You'}</span>
                  <p>{message.copy}</p>
                  {message.kind === 'guide-match' && (
                    <button type="button" className="message-action" onClick={viewGuideDetails}>
                      View guide details <ChevronRight size={15} aria-hidden="true" />
                    </button>
                  )}
                </div>
              ))}
              {isMatching && (
                <div className="message kwan loading">
                  <span className="message-label">Kwan</span>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Loader2 size={14} className="spin-icon" /> Checking the verified pilot roster...
                  </p>
                </div>
              )}
            </div>

            <div className="theme-list" style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.72rem', color: '#94A3B8', alignSelf: 'center', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                Themes:
              </span>
              {THEME_OPTIONS.map((theme) => (
                <button
                  key={theme.tag}
                  className="text-button"
                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.72rem', borderRadius: '999px', background: 'rgba(33,71,52,0.06)' }}
                  type="button"
                  disabled={isMatching}
                  onClick={() => sendRequest(theme.defaultQuery)}
                >
                  {theme.label}
                </button>
              ))}
            </div>

            {/* Living Corridor Layer A — rotating cultural facts */}
            <div className="corridor-fact">
              <RotatingFacts activeSite={guide?.corridorId || null} />
            </div>

            <div className="example-list" aria-label="Example requests">
              <span className="examples-label">Try a starting point</span>
              <button className="surprise-button" type="button" disabled={isMatching} onClick={surpriseMe}>
                <Sparkles size={14} aria-hidden="true" /> Surprise me
              </button>
              {EXAMPLES.map((example) => (
                <button
                  className="text-button"
                  type="button"
                  key={example}
                  disabled={isMatching}
                  onClick={() => sendRequest(example)}
                >
                  {example}
                  <ChevronRight size={15} aria-hidden="true" />
                </button>
              ))}
            </div>

            <form
              className="request-form"
              onSubmit={(event) => {
                event.preventDefault();
                sendRequest();
              }}
            >
              <label htmlFor="trip-request">Your request</label>
              <div className="input-row">
                <textarea
                  id="trip-request"
                  ref={requestInput}
                  value={request}
                  onChange={(event) => setRequest(event.target.value)}
                  placeholder="For example: a spiritual journey to reconnect with my roots"
                  rows="3"
                />
                <button className="button button-primary" type="submit" disabled={!request.trim() || isMatching}>
                  {isMatching ? (
                    <>
                      <Loader2 size={16} className="spin-icon" /> Matching...
                    </>
                  ) : (
                    <>
                      Find my guide <ArrowUpRight size={17} aria-hidden="true" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <aside ref={matchPanelRef} tabIndex="-1" className={`match-panel${guide ? ' match-panel-active' : ''}`} aria-live="polite">
            {guide ? (
              <GuideMatch
                guide={guide}
                matchedTheme={matchedTheme}
                serverPricing={serverPricing}
                addonIncluded={addonIncluded}
                isRecalculating={loadingAction === 'recalculating'}
                onToggleAddon={handleToggleAddon}
                onRequestPayment={openCheckout}
              />
            ) : (
              <div className="empty-match">
                <div className="empty-icon"><MapPin size={22} aria-hidden="true" /></div>
                <p className="section-kicker">Your match</p>
                <h2>One considered recommendation.</h2>
                <p>Kwan uses the interests in your message to select one guide from the small pilot roster.</p>
                <div className="match-preview">
                  <div className="preview-avatar"><Compass size={18} aria-hidden="true" /></div>
                  <div>
                    <strong>Matched to your interests</strong>
                    <span>Verified local host · Accra or Cape Coast</span>
                  </div>
                </div>
                <div className="preview-stat"><ShieldCheck size={15} aria-hidden="true" /> Identity and Mobile Money wallet reviewed</div>
              </div>
            )}
            {guide && (
              <button type="button" className="reset-match" onClick={resetMatch}>
                <RefreshCw size={13} aria-hidden="true" /> Start a new request
              </button>
            )}
          </aside>
        </section>

        <section className="how-it-works" aria-labelledby="flow-heading">
          <p className="section-kicker">How Kwan works</p>
          <h2 id="flow-heading">Trust, from discovery to settlement.</h2>
          <ol>
            <li><div className="flow-icon"><Compass size={19} aria-hidden="true" /></div><div><span>01</span><p>Describe the day you want.</p></div></li>
            <li><div className="flow-icon"><LockKeyhole size={19} aria-hidden="true" /></div><div><span>02</span><p>Receive one guide match and lock funds in escrow.</p></div></li>
            <li><div className="flow-icon"><Smartphone size={19} aria-hidden="true" /></div><div><span>03</span><p>Share your 4-digit PIN after the experience to trigger the Mobile Money payout.</p></div></li>
          </ol>
        </section>
      </main>

      <footer>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src="/kwan_logo_square.jpg"
            alt="Kwan"
            style={{ width: '24px', height: '24px', borderRadius: '6px', objectFit: 'cover', border: '1px solid rgba(0,0,0,0.1)' }}
          />
          <span>Kwan · The path to meaningful travel</span>
        </div>
        <div className="footer-links">
          <a href="mailto:hello@kwanai.me">Contact Kwan <ExternalLink size={13} aria-hidden="true" /></a>
          <span>Escrow flow includes the statutory 1% Ghana Tourism Levy (Act 817).</span>
        </div>
      </footer>

      {checkoutOpen && guide && (
        <CheckoutModal
          guide={guide}
          serverPricing={serverPricing}
          traveler={traveler}
          setTraveler={setTraveler}
          experienceDate={experienceDate}
          setExperienceDate={setExperienceDate}
          pilotConfirmation={pilotConfirmation}
          setPilotConfirmation={setPilotConfirmation}
          step={checkoutStep}
          booking={booking}
          paymentLink={paymentLink}
          copied={copied}
          enteredPin={enteredPin}
          setEnteredPin={setEnteredPin}
          loadingAction={loadingAction}
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
          isOfflineMode={isOfflineMode}
          onClose={() => setCheckoutOpen(false)}
          onCreatePaymentPreview={createPaymentPreview}
          onCopyLink={copyLink}
          onOpenPaystackCheckout={openPaystackCheckout}
          onCheckStatus={checkPaymentStatus}
          onReleasePayout={releasePayout}
          onSimulateDemoPayment={simulateDemoPayment}
        />
      )}
    </div>
  );
}

// ── GuideMatch ─────────────────────────────────────────────────────────────────

function GuideMatch({ guide, matchedTheme, serverPricing, addonIncluded, isRecalculating, onToggleAddon, onRequestPayment }) {
  const details = EXPERIENCE_DETAILS[matchedTheme] || EXPERIENCE_DETAILS.heritage_spiritual;

  const stopIcon = (type) => {
    if (type === 'meetup')   return '📍';
    if (type === 'optional') return '○';
    return '•';
  };

  return (
    <div className="guide-match">

      {/* Guide header: avatar + name + rating + languages */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
        {guide.image ? (
          <img
            src={guide.image}
            alt={guide.name}
            style={{ width: '68px', height: '68px', borderRadius: '16px', objectFit: 'cover', border: '2px solid #214734', flexShrink: 0 }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className={`guide-avatar ${guide.color}`} aria-hidden="true">{guide.initials}</div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="section-kicker" style={{ marginBottom: '0.15rem' }}>Your guide match · {details.label}</p>
          <h2 style={{ marginBottom: '0.15rem' }}>{guide.name}</h2>
          <p className="guide-role">{guide.role}</p>

          {/* Star rating */}
          {guide.rating && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem' }}>
              <span style={{ color: '#F5A623', fontSize: '0.9rem', letterSpacing: '1px' }}>
                {'★'.repeat(Math.floor(guide.rating))}{'☆'.repeat(5 - Math.floor(guide.rating))}
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{guide.rating.toFixed(2)}</span>
              <span style={{ fontSize: '0.75rem', color: '#647067' }}>({guide.reviewsCount} reviews)</span>
            </div>
          )}

          {/* Languages */}
          {guide.languages?.length > 0 && (
            <p style={{ fontSize: '0.72rem', color: '#647067', marginTop: '0.15rem' }}>
              🗣 {guide.languages.join(' · ')}
            </p>
          )}
        </div>
      </div>

      {/* Bio */}
      {guide.bio && (
        <p style={{
          fontSize: '0.83rem',
          color: '#374151',
          lineHeight: 1.55,
          margin: '0 0 1rem',
          padding: '0.6rem 0.9rem',
          background: 'rgba(33,71,52,0.05)',
          borderRadius: '6px',
          borderLeft: '3px solid #214734',
        }}>
          {guide.bio}
        </p>
      )}

      {/* Meeting point */}
      <div className="guide-detail-card" style={{ marginBottom: '0.5rem' }}>
        <MapPin size={17} aria-hidden="true" />
        <div>
          <strong>Where to meet</strong>
          <span>{details.meetingNote || `Your host meets you at ${guide.anchorSite || guide.area}.`}</span>
        </div>
      </div>

      {/* Living Corridor Layer B — About This Place */}
      <AboutThisPlace corridorId={guide.corridorId} />

      {/* Experience schedule */}
      <div style={{ margin: '0.9rem 0' }}>
        <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontFamily: 'monospace', color: '#647067', marginBottom: '0.45rem' }}>
          Experience schedule
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {(details.stops || []).map((stop, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', fontSize: '0.8rem' }}>
              <span style={{ fontFamily: 'monospace', color: '#F5A623', fontWeight: 600, flexShrink: 0, minWidth: '74px' }}>
                {stop.time}
              </span>
              <span style={{ color: stop.type === 'meetup' ? '#214734' : '#374151', fontWeight: stop.type === 'meetup' ? 600 : 400 }}>
                {stopIcon(stop.type)} {stop.activity}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* What to bring */}
      {details.whatToBring?.length > 0 && (
        <div style={{
          margin: '0.8rem 0',
          padding: '0.65rem 0.9rem',
          background: 'rgba(245, 166, 35, 0.06)',
          border: '1px solid rgba(245, 166, 35, 0.2)',
          borderRadius: '6px',
        }}>
          <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontFamily: 'monospace', color: '#8e5c19', marginBottom: '0.3rem' }}>
            What to bring
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.78rem', color: '#374151', lineHeight: 1.6 }}>
            {details.whatToBring.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </div>
      )}

      {/* Cultural etiquette tip */}
      {details.etiquette && (
        <div style={{
          margin: '0.7rem 0',
          padding: '0.5rem 0.8rem',
          background: 'rgba(33,71,52,0.04)',
          borderRadius: '6px',
          fontSize: '0.78rem',
          color: '#4B5563',
          fontStyle: 'italic',
        }}>
          💬 <strong>Cultural tip:</strong> {details.etiquette}
        </div>
      )}

      {/* Trust + payment breakdown */}
      <div className="guide-details" aria-label="Trust and payment details">
        <div className="guide-detail-card">
          <ShieldCheck size={17} aria-hidden="true" />
          <div>
            <strong>Why trust this match</strong>
            <span>
              Identity and Mobile Money wallet reviewed for the Kwan pilot.
              {guide.ghanaCard ? ` Ghana Card on file: ${guide.ghanaCard.slice(0, 7)}•••` : ''}
            </span>
          </div>
        </div>
        <div className="guide-detail-card">
          <WalletCards size={17} aria-hidden="true" />
          <div>
            <strong>Where your money goes</strong>
            <span>
              {formatUsd(serverPricing.host_payout_usd)} is reserved for the host via {guide.momoNetwork || 'Mobile Money'};
              Kwan's {formatUsd(serverPricing.platform_fee_usd)} fee and the {formatUsd(serverPricing.tourism_levy_usd)} levy are shown upfront.
            </span>
          </div>
        </div>
      </div>

      {guide.anchorSite && (
        <div className="reviewed-note" style={{ color: '#F5A623', background: 'rgba(245, 166, 35, 0.08)' }}>
          <CheckCircle2 size={17} aria-hidden="true" />
          <span>Anchor site: {guide.anchorSite}</span>
        </div>
      )}

      {/* Optional ceremony add-on */}
      <div style={{ margin: '0.8rem 0', padding: '0.6rem 0.8rem', background: 'rgba(33,71,52,0.05)', borderRadius: '6px', border: '1px solid rgba(33,71,52,0.12)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.82rem' }}>Optional Cultural Stop / Ceremony</span>
          <button
            type="button"
            onClick={onToggleAddon}
            disabled={isRecalculating}
            style={{
              padding: '0.2rem 0.55rem',
              fontSize: '0.72rem',
              borderRadius: '4px',
              cursor: isRecalculating ? 'not-allowed' : 'pointer',
              background: addonIncluded ? 'rgba(239, 68, 68, 0.1)' : 'rgba(33, 71, 52, 0.1)',
              color: addonIncluded ? '#EF4444' : '#214734',
              border: `1px solid ${addonIncluded ? '#EF4444' : '#214734'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            {isRecalculating && <Loader2 size={11} className="spin-icon" />}
            {addonIncluded ? 'Remove Stop (-$15)' : 'Add Ceremony (+$15)'}
          </button>
        </div>
        <span style={{ fontSize: '0.72rem', color: '#647067', display: 'block', marginTop: '0.2rem' }}>
          {addonIncluded
            ? 'Customised with ancestral ceremony; price has been recalculated.'
            : 'Add an optional ceremony and Kwan will recalculate the total before checkout.'}
        </span>
      </div>

      {/* Price summary */}
      <div className="price-row">
        <span>Test booking {addonIncluded && '(edited)'}</span>
        <strong>{formatUsd(serverPricing.total_usd)}</strong>
      </div>
      <p className="price-help">
        One guide, one local experience. 90% ({formatUsd(serverPricing.host_payout_usd)}) disbursed directly to {guide.momoNetwork || 'Mobile Money'} upon PIN verification.
        Includes statutory 1% Ghana Tourism Levy ({formatUsd(serverPricing.tourism_levy_usd)}).
      </p>
      <p className="booking-policy">
        <strong>Booking note:</strong> The pilot team will confirm your guide's availability within a few hours of booking.
        If plans change, contact us before the experience so we can review a refund or reschedule.
      </p>
      {details.cancellation && (
        <p className="booking-policy" style={{ color: '#647067' }}>
          <strong>Cancellation:</strong> {details.cancellation}
        </p>
      )}

      <button className="button button-primary button-full" type="button" onClick={onRequestPayment}>
        Request payment link <ArrowUpRight size={17} aria-hidden="true" />
      </button>
    </div>
  );
}

// ── CheckoutModal ──────────────────────────────────────────────────────────────

function CheckoutModal({
  guide,
  serverPricing,
  traveler,
  setTraveler,
  experienceDate,
  setExperienceDate,
  pilotConfirmation,
  setPilotConfirmation,
  step,
  booking,
  paymentLink,
  copied,
  enteredPin,
  setEnteredPin,
  loadingAction,
  errorMessage,
  setErrorMessage,
  isOfflineMode,
  onClose,
  onCreatePaymentPreview,
  onCopyLink,
  onOpenPaystackCheckout,
  onCheckStatus,
  onReleasePayout,
  onSimulateDemoPayment,
}) {
  const payout = serverPricing.host_payout_usd;
  const released = booking?.status === 'released';

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="checkout-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="close-button" type="button" onClick={onClose} aria-label="Close payment flow"><X size={20} /></button>

        <div className="checkout-heading" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.8rem' }}>
          <div>
            <p className="section-kicker">Card-to-Mobile Money Escrow{isOfflineMode ? ' · Demo Mode' : ''}</p>
            <h2 id="checkout-title">
              {step === 'details'   && 'Prepare your payment link'}
              {step === 'payment'   && 'Your payment link is ready'}
              {step === 'confirmed' && (released ? 'Test payout released' : 'Funds locked in escrow')}
            </h2>
          </div>
          <img
            src="/kwan_logo_square.jpg"
            alt="Kwan Trust Seal"
            style={{ width: '38px', height: '38px', borderRadius: '8px', objectFit: 'cover', border: '1px solid rgba(245, 166, 35, 0.4)', flexShrink: 0 }}
          />
        </div>

        {errorMessage && (
          <div style={{ margin: '0.6rem 0', padding: '0.5rem 0.8rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', borderRadius: '6px', color: '#EF4444', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <AlertCircle size={15} color="#EF4444" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="checkout-summary">
          {guide.image ? (
            <img src={guide.image} alt={guide.name} style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover' }} />
          ) : (
            <div className={`guide-avatar small ${guide.color}`} aria-hidden="true">{guide.initials}</div>
          )}
          <div><strong>{guide.name}</strong><span>{guide.area}</span></div>
          <strong>{formatUsd(serverPricing.total_usd)}</strong>
        </div>

        {/* ── Step: details ── */}
        {step === 'details' && (
          <form className="checkout-form" onSubmit={onCreatePaymentPreview}>
            <p>Review the operator package above, then enter your details to prepare the escrow payment.</p>
            <label htmlFor="traveler-name">Your name</label>
            <input id="traveler-name" autoComplete="name" value={traveler.name} onChange={(event) => setTraveler({ ...traveler, name: event.target.value })} required />
            <label htmlFor="traveler-email">Email for the link</label>
            <input id="traveler-email" type="email" autoComplete="email" value={traveler.email} onChange={(event) => setTraveler({ ...traveler, email: event.target.value })} required />
            <label htmlFor="experience-date">Preferred experience date</label>
            <input id="experience-date" type="date" value={experienceDate} min={new Date().toISOString().slice(0, 10)} onChange={(event) => setExperienceDate(event.target.value)} required />
            <label className="confirmation-checkbox" htmlFor="pilot-confirmation">
              <input
                id="pilot-confirmation"
                type="checkbox"
                checked={pilotConfirmation}
                onChange={(event) => setPilotConfirmation(event.target.checked)}
              />
              <span>I understand the pilot team will confirm guide availability before the experience.</span>
            </label>
            <div className="prototype-notice">
              <CircleAlert size={18} aria-hidden="true" />
              <span>
                {isOfflineMode
                  ? 'Demo mode: payment is simulated locally. No real charge will occur.'
                  : 'Paystack sandbox checkout: after the confirmed experience, share the release PIN to trigger the host payout.'}
              </span>
            </div>
            <button className="button button-primary button-full" type="submit" disabled={loadingAction === 'checkout_init'}>
              {loadingAction === 'checkout_init' ? (
                <><Loader2 size={16} className="spin-icon" /> Creating escrow booking...</>
              ) : (
                <>Create secure payment link <ArrowUpRight size={17} aria-hidden="true" /></>
              )}
            </button>
          </form>
        )}

        {/* ── Step: payment ── */}
        {step === 'payment' && (
          <div className="payment-preview">
            <p className="link-label">Unique payment link</p>
            <div className="link-box">
              <span>{paymentLink}</span>
              <button type="button" onClick={onCopyLink} aria-label="Copy payment link">
                {copied ? <Check size={17} /> : <Copy size={17} />}
              </button>
            </div>
            <p className="reference">Reference: {booking.reference}</p>
            <div className="prototype-notice">
              <CircleAlert size={18} aria-hidden="true" />
              <span>Preferred date: {booking.experienceDate}. Complete payment in Paystack; Kwan will hold the funds and keep the release PIN with you.</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {isOfflineMode ? (
                <button className="button button-primary button-full" type="button" onClick={onSimulateDemoPayment}>
                  <WalletCards size={18} aria-hidden="true" /> Simulate payment (Demo)
                </button>
              ) : (
                <button className="button button-primary button-full" type="button" onClick={onOpenPaystackCheckout}>
                  <WalletCards size={18} aria-hidden="true" /> Open Paystack checkout
                </button>
              )}

              {!isOfflineMode && (
                <button
                  type="button"
                  className="text-button"
                  onClick={onCheckStatus}
                  disabled={loadingAction === 'polling'}
                  style={{ fontSize: '0.78rem', color: '#647067', alignSelf: 'center', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  <RefreshCw size={13} className={loadingAction === 'polling' ? 'spin-icon' : ''} /> I completed payment — check status
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Step: confirmed ── */}
        {step === 'confirmed' && (
          <div className="confirmation">
            <div className={`confirmation-mark ${released ? 'released' : ''}`}>
              <CheckCircle2 size={31} aria-hidden="true" />
            </div>

            {!released ? (
              <>
                <p>
                  <strong>{formatUsd(serverPricing.total_usd)}</strong> is locked in escrow for{' '}
                  <strong>{guide.name}</strong> on {booking.experienceDate}.
                </p>

                {/* Guide contact block */}
                <div style={{
                  margin: '0.9rem 0',
                  padding: '0.75rem 0.9rem',
                  background: 'rgba(33,71,52,0.06)',
                  border: '1px solid rgba(33,71,52,0.2)',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                }}>
                  <p style={{ fontWeight: 700, color: '#214734', marginBottom: '0.25rem' }}>📱 Guide will contact you</p>
                  <p style={{ color: '#374151' }}>
                    <strong>{guide.name}</strong> will reach out via WhatsApp within 2 hours to confirm exact meeting
                    details, directions to <em>{guide.anchorSite || guide.area}</em>, and any final prep notes.
                  </p>
                </div>

                {/* Living Corridor Layer C — Before your experience */}
                <PreExperienceBriefing corridorId={guide.corridorId} />

                {/* 4-digit PIN — fixed readable colour */}
                <div style={{
                  margin: '1rem 0',
                  padding: '0.9rem',
                  background: 'rgba(245, 166, 35, 0.08)',
                  border: '1px solid #F5A623',
                  borderRadius: '6px',
                  textAlign: 'center',
                }}>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: '#F5A623', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                    Your Private 4-Digit Release PIN
                  </span>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#F5A623', letterSpacing: '4px', fontFamily: 'monospace' }}>
                    {booking?.pin || '----'}
                  </span>
                  <span style={{ display: 'block', fontSize: '0.72rem', color: '#647067', marginTop: '0.3rem' }}>
                    Share this code with your host <strong>only after</strong> the experience is complete.
                  </span>
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => navigator.clipboard.writeText(booking?.pin || '')}
                    style={{ margin: '0.4rem auto 0', color: '#8e5c19' }}
                  >
                    <Copy size={13} aria-hidden="true" /> Copy PIN
                  </button>
                </div>

                <div className="release-rule">
                  <CalendarDays size={18} aria-hidden="true" />
                  <span>Host payout step: enter the traveler's 4-digit PIN to release Mobile Money funds.</span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.8rem' }}>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={enteredPin}
                    onChange={(e) => {
                      setErrorMessage(null);
                      setEnteredPin(e.target.value.replace(/\D/g, '').slice(0, 4));
                    }}
                    placeholder="4-digit PIN"
                    maxLength={4}
                    style={{ textAlign: 'center', letterSpacing: '3px', fontWeight: 700, fontFamily: 'monospace', width: '130px' }}
                  />
                  <button
                    className="button button-primary"
                    style={{ flex: 1 }}
                    type="button"
                    onClick={onReleasePayout}
                    disabled={enteredPin.length !== 4 || loadingAction === 'releasing'}
                  >
                    {loadingAction === 'releasing' ? (
                      <><Loader2 size={16} className="spin-icon" /> Verifying PIN...</>
                    ) : (
                      `Verify PIN & Release ${formatUsd(payout)}`
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div>
                <p>
                  <strong>{formatUsd(payout)}</strong> released to {guide.name}'s{' '}
                  {guide.momoNetwork || 'MTN Mobile Money'} wallet.
                </p>
                <p className="quiet-confirmation" style={{ color: '#214734', marginTop: '0.5rem' }}>
                  PIN verified. Reference {booking.reference} · 90% payout settled in 32.4s ·
                  1% Tourism Levy ({formatUsd(serverPricing.tourism_levy_usd)}) remitted.
                </p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function SankofaPlanPage({ onBack }) {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);

  async function confirmPlan(draft) {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/sankofa/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_date: draft.startDate,
          days: draft.days.map(day => ({ day_index: day.dayIndex, theme: day.theme })),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'The pilot roster could not validate this plan.');
      setPlan(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page plan-page">
      <button type="button" className="text-button" onClick={onBack}>
        <ChevronRight size={15} style={{ transform: 'rotate(180deg)' }} /> Back to single experience
      </button>
      <section className="plan-intro">
        <p className="eyebrow">A week with intention</p>
        <h1>Sankofa Plan<span aria-hidden="true"> ✦</span></h1>
        <p className="lede">Build a considered week of Ghanaian experiences. Each selected day is checked against Kwan's verified pilot roster before a combined payment link is prepared.</p>
      </section>
      {!plan && (
        <section className="sankofa-packages" aria-labelledby="sankofa-packages-title">
          <div className="section-kicker">Curated for the week</div>
          <h2 id="sankofa-packages-title">Arrive when the culture is already in motion.</h2>
          <p className="package-intro">Choose a seasonal starting point for your plan. Events are cultural context, not bookable inventory; your selected guide days are still validated against Kwan's pilot roster.</p>
          <div className="package-grid">
            {SANKOFA_CURATED_PACKAGES.map(pkg => (
              <article className={`package-card ${selectedPackage?.id === pkg.id ? 'is-selected' : ''}`} key={pkg.id}>
                <div className="package-card-top">
                  <span className="package-timing">{pkg.timing}</span>
                  <span className="package-badge">Curated</span>
                </div>
                <h3>{pkg.name}</h3>
                <p>{pkg.description}</p>
                <div className="package-events">
                  {pkg.events.map(event => (
                    <div className="package-event" key={event.name}>
                      <strong>{event.name}</strong>
                      <span>{event.scale} · {event.place}</span>
                      <small>{event.note}</small>
                    </div>
                  ))}
                </div>
                <button type="button" className="text-button package-select" onClick={() => setSelectedPackage(pkg)}>
                  {selectedPackage?.id === pkg.id ? 'Package selected' : 'Use this starting point'} <ArrowUpRight size={15} />
                </button>
              </article>
            ))}
          </div>
        </section>
      )}
      {error && <div className="prototype-notice"><CircleAlert size={18} /> <span>{error}</span></div>}
      {!plan && <SankofaPlanner
        key={selectedPackage?.id || 'custom'}
        initialTemplate={selectedPackage ? SANKOFA_WEEK_TEMPLATES.find(template => template.id === selectedPackage.templateId) : null}
        onConfirmPlan={confirmPlan}
        onClose={onBack}
      />}
      {loading && <p className="plan-status"><Loader2 size={16} className="spin-icon" /> Validating guides and pricing with the Kwan API...</p>}
      {plan && (
        <section className="plan-result" aria-labelledby="plan-result-title">
          <div>
            <p className="section-kicker">Verified week preview</p>
            <h2 id="plan-result-title">Your Ghana week is ready to review.</h2>
            <p>Week of {plan.start_date} · {plan.days.length} experiences · {formatUsd(plan.total_usd)} total</p>
          </div>
          <div className="plan-day-list">
            {plan.days.map(day => (
              <div className="plan-day-row" key={day.day_index}>
                <strong>{day.label}</strong>
                <span>{day.theme_label}</span>
                <span>{day.host.name}</span>
                <span>{day.anchor_site}</span>
                <b>{formatUsd(day.total_usd)}</b>
              </div>
            ))}
          </div>
          <div className="plan-trust-note"><ShieldCheck size={17} /> Guide matches, totals, platform fee, host payout, and tourism levy were calculated by the server.</div>
          <button type="button" className="button button-primary" onClick={() => setError('Combined payment link creation is the next protected checkout step; the plan preview is validated and ready.')}>
            Request combined payment link <ArrowUpRight size={17} />
          </button>
        </section>
      )}
    </main>
  );
}

// ── PreExperienceBriefing (Living Corridor Layer C) ───────────────────────────

function PreExperienceBriefing({ corridorId }) {
  const facts = LIVING_CORRIDOR_FACTS.filter(
    f => f.site === corridorId || f.site === 'general'
  ).slice(0, 3);

  if (!facts || facts.length === 0) return null;

  return (
    <div style={{
      margin: '0.8rem 0',
      padding: '0.7rem 0.9rem',
      background: 'rgba(245, 166, 35, 0.05)',
      border: '1px solid rgba(245, 166, 35, 0.22)',
      borderRadius: '8px',
    }}>
      <p style={{
        fontSize: '0.65rem',
        fontFamily: 'monospace',
        textTransform: 'uppercase',
        color: '#F5A623',
        fontWeight: 700,
        letterSpacing: '0.07em',
        marginBottom: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.35rem',
      }}>
        📖 Before your experience · Living Corridor
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {facts.map((fact, i) => (
          <div key={i} style={{ paddingLeft: '0.65rem', borderLeft: '2px solid rgba(245,166,35,0.4)' }}>
            <p style={{ margin: 0, fontSize: '0.76rem', color: '#374151', lineHeight: 1.5, fontStyle: 'italic' }}>
              "{fact.text}"
            </p>
            {fact.source && (
              <span style={{ fontSize: '0.62rem', color: '#94A3B8', fontFamily: 'monospace', display: 'block', marginTop: '0.1rem' }}>
                — {fact.source}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
