import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Compass,
  Copy,
  ExternalLink,
  Info,
  Languages,
  LockKeyhole,
  Loader2,
  MapPin,
  MessageCircle,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Smartphone,
  Star,
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
      copy: 'Tell us how you would like to experience Ghana. Kwan recommends a verified local host, selected for your interests and protected by our pilot escrow system.',
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

      // Redirect smoothly to the dedicated guide dossier page
      window.setTimeout(() => {
        navigate('/guide');
      }, 750);

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

        window.setTimeout(() => {
          navigate('/guide');
        }, 750);
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
        copy: 'Tell us how you would like to experience Ghana. Kwan recommends a verified local host, selected for your interests and protected by our pilot escrow system.',
      },
    ]);
    setRequest('');
    setErrorMessage(null);
    if (window.location.pathname !== '/') {
      navigate('/');
    }
    window.setTimeout(() => requestInput.current?.focus(), 150);
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

  async function simulateEscrowLock() {
    if (!booking?.reference) return;
    setLoadingAction('simulating_escrow');
    setErrorMessage(null);

    if (isOfflineMode || booking.status === 'demo') {
      simulateDemoPayment();
      setLoadingAction(null);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/checkout/simulate-escrow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: booking.reference }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Simulation failed.');
      setBooking((current) => ({
        ...current,
        status: 'held',
        pin: data.release_pin,
      }));
      setCheckoutStep('confirmed');
    } catch (err) {
      setErrorMessage(`Escrow lock simulation error: ${err.message}`);
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

  if (pathname === '/guide') {
    return (
      <div className="site-shell">
        <header className="topbar">
          <a className="brand" href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }} aria-label="Kwan home" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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

        <GuideProfilePage
          guide={guide}
          matchedTheme={matchedTheme}
          serverPricing={serverPricing}
          addonIncluded={addonIncluded}
          isRecalculating={loadingAction === 'recalculating'}
          onToggleAddon={handleToggleAddon}
          onRequestPayment={openCheckout}
          onReset={resetMatch}
          onBackToChat={() => navigate('/')}
        />

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
            onSimulateEscrowLock={simulateEscrowLock}
            onReleasePayout={releasePayout}
            onSimulateDemoPayment={simulateDemoPayment}
          />
        )}
      </div>
    );
  }

  return (
    <div className="site-shell">
      <header className="topbar">
        <a className="brand" href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }} aria-label="Kwan home" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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

      <main id="top" className="page chat-page">
        <section className="intro hero-intro" aria-labelledby="page-title">
          <div className="hero-content">
            <p className="eyebrow">Grassroots cultural travel</p>
            <h1 id="page-title">One conversation.<br />One local guide.</h1>
            <p className="lede">
              Describe the experience you want in Ghana. Kwan connects you with one trusted local host and makes the next step simple.
            </p>
            <div className="method-note">
              <ShieldCheck size={18} aria-hidden="true" />
              <span>Every host is identity- and Mobile Money-wallet reviewed before they welcome a traveler.</span>
            </div>
          </div>
          <div className="hero-features" aria-label="Pilot trust highlights">
            <div className="hero-feature-item">
              <div className="hero-feature-icon"><LockKeyhole size={18} aria-hidden="true" /></div>
              <div className="hero-feature-text">
                <strong>Escrow Protected</strong>
                <span>Funds released only upon traveler 4-digit PIN verification</span>
              </div>
            </div>
            <div className="hero-feature-item">
              <div className="hero-feature-icon"><MapPin size={18} aria-hidden="true" /></div>
              <div className="hero-feature-text">
                <strong>Verified Local Hosts</strong>
                <span>Cape Coast historians, Ga Mashie elders, High Street artisans</span>
              </div>
            </div>
            <div className="hero-feature-item">
              <div className="hero-feature-icon"><Smartphone size={18} aria-hidden="true" /></div>
              <div className="hero-feature-text">
                <strong>Direct Mobile Money</strong>
                <span>90% goes straight to your host's MTN or Telecel wallet</span>
              </div>
            </div>
          </div>
        </section>

        <section className="chat-container-section" aria-label="Conversation and guide match">
          <div className="chat-container-panel">
            <div className="panel-heading">
              <div>
                <p className="section-kicker">Start here</p>
                <h2>What would you like to experience?</h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => navigate('/plan')}
                  className="sankofa-pill-btn"
                  aria-label="Open Sankofa week planner"
                >
                  <Sparkles size={12} aria-hidden="true" />
                  <span>Sankofa Plan</span>
                </button>
                <MessageCircle size={20} aria-hidden="true" />
              </div>
            </div>

            {/* Conversation Messages */}
            <div className="messages" aria-live="polite">
              {conversation.map((message, index) => (
                <div className={`message ${message.role}${message.kind ? ` message-${message.kind}` : ''}`} key={`${message.role}-${index}`}>
                  <span className="message-label">{message.role === 'kwan' ? 'Kwan' : 'You'}</span>
                  <p>{message.copy}</p>
                  {message.kind === 'guide-match' && (message.guide || guide) && (
                    <div className="chat-match-card">
                      <div className="chat-match-card-top">
                        {(message.guide?.image || guide?.image) ? (
                          <img
                            src={message.guide?.image || guide?.image}
                            alt={message.guide?.name || guide?.name}
                            className="chat-match-thumb"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div className={`guide-avatar small ${(message.guide?.color || guide?.color || 'ochre')}`}>
                            {(message.guide?.initials || guide?.initials || 'NK')}
                          </div>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: 0 }}>
                          <div className="chat-match-name-row">
                            <strong>{message.guide?.name || guide?.name}</strong>
                            <span className="chat-verified-badge"><CheckCircle2 size={11} aria-hidden="true" /> Verified</span>
                          </div>
                          <span className="chat-match-role">{message.guide?.role || guide?.role}</span>
                          <span className="chat-match-site"><MapPin size={11} aria-hidden="true" /> {message.guide?.anchorSite || guide?.anchorSite}</span>
                        </div>
                        <div className="chat-match-price">
                          <strong>{formatUsd(message.guide?.price || guide?.price || 50)}</strong>
                          <span>/ experience</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="chat-view-dossier-btn"
                        onClick={() => navigate('/guide')}
                      >
                        View Full Guide Profile &amp; Dossier <ArrowRight size={15} aria-hidden="true" />
                      </button>
                    </div>
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
          </div>
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
          onSimulateEscrowLock={simulateEscrowLock}
          onReleasePayout={releasePayout}
          onSimulateDemoPayment={simulateDemoPayment}
        />
      )}
    </div>
  );
}

// ── GuideProfilePage (Dedicated /guide route) ──────────────────────────────────

function GuideProfilePage({
  guide,
  matchedTheme,
  serverPricing,
  addonIncluded,
  isRecalculating,
  onToggleAddon,
  onRequestPayment,
  onReset,
  onBackToChat,
}) {
  if (!guide) {
    return (
      <main className="page guide-page-shell">
        <div className="empty-guide-page">
          <div className="empty-icon"><Compass size={28} aria-hidden="true" /></div>
          <h2>No Guide Recommendation Selected Yet</h2>
          <p>Describe what you would like to experience in Ghana, and Kwan will match you with a verified local host.</p>
          <button type="button" className="button button-primary" onClick={onBackToChat}>
            <ArrowLeft size={16} aria-hidden="true" /> Return to Chat
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="page guide-page-shell">
      <div className="guide-page-nav">
        <button type="button" className="guide-nav-btn back-btn" onClick={onBackToChat}>
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Back to Chat</span>
        </button>
        <div className="guide-nav-status">
          <ShieldCheck size={14} aria-hidden="true" />
          <span>Verified Host Dossier · Pilot Program</span>
        </div>
        <button type="button" className="guide-nav-btn new-btn" onClick={onReset}>
          <Plus size={16} aria-hidden="true" />
          <span>New Request</span>
        </button>
      </div>

      <GuideMatch
        guide={guide}
        matchedTheme={matchedTheme}
        serverPricing={serverPricing}
        addonIncluded={addonIncluded}
        isRecalculating={isRecalculating}
        onToggleAddon={onToggleAddon}
        onRequestPayment={onRequestPayment}
        onReset={onReset}
      />
    </main>
  );
}

// ── GuideMatch ─────────────────────────────────────────────────────────────────

function GuideMatch({ guide, matchedTheme, serverPricing, addonIncluded, isRecalculating, onToggleAddon, onRequestPayment, onReset }) {
  const details = EXPERIENCE_DETAILS[matchedTheme] || EXPERIENCE_DETAILS.heritage_spiritual;

  const renderStopIcon = (type) => {
    if (type === 'meetup') {
      return (
        <span className="schedule-timeline-icon meetup" title="Meetup Point">
          <MapPin size={13} aria-hidden="true" />
        </span>
      );
    }
    if (type === 'cultural') {
      return (
        <span className="schedule-timeline-icon cultural" title="Cultural Interaction">
          <Sparkles size={13} aria-hidden="true" />
        </span>
      );
    }
    if (type === 'optional') {
      return (
        <span className="schedule-timeline-icon optional" title="Optional Activity">
          <CheckCircle2 size={13} aria-hidden="true" />
        </span>
      );
    }
    return (
      <span className="schedule-timeline-icon main" title="Main Experience">
        <Compass size={13} aria-hidden="true" />
      </span>
    );
  };

  return (
    <div className="guide-match">
      {/* Guide Header Banner */}
      <div className="guide-match-header">
        <div className="guide-avatar-wrap">
          {guide.image ? (
            <img
              src={guide.image}
              alt={guide.name}
              className="guide-avatar-img"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className={`guide-avatar ${guide.color}`} aria-hidden="true">{guide.initials}</div>
          )}
          <span className="guide-verified-badge" title="Identity & Mobile Money Reviewed">
            <CheckCircle2 size={13} aria-hidden="true" /> Verified
          </span>
        </div>
        <div className="guide-header-info">
          <div className="guide-header-top">
            <span className="section-kicker">Your guide match · {details.label}</span>
            {guide.anchorSite && (
              <span className="guide-anchor-chip">
                <MapPin size={12} aria-hidden="true" /> {guide.anchorSite}
              </span>
            )}
          </div>
          <h2>{guide.name}</h2>
          <p className="guide-role">{guide.role}</p>

          <div className="guide-meta-row">
            {guide.rating && (
              <div className="guide-rating-pill">
                <Star size={13} fill="#F5A623" color="#F5A623" aria-hidden="true" />
                <strong>{guide.rating.toFixed(2)}</strong>
                <span>({guide.reviewsCount} reviews)</span>
              </div>
            )}
            {guide.languages?.length > 0 && (
              <span className="guide-lang-pill">
                <Languages size={13} aria-hidden="true" />
                <span>{guide.languages.join(' · ')}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2-Column Responsive Body */}
      <div className="guide-match-body">
        {/* Left Sub-Column: Experience Details */}
        <div className="guide-content-col">
          {guide.bio && (
            <div className="guide-bio-card">
              <p>{guide.bio}</p>
            </div>
          )}

          <div className="guide-detail-card">
            <MapPin size={17} aria-hidden="true" />
            <div>
              <strong>Where to meet</strong>
              <span>{details.meetingNote || `Your host meets you at ${guide.anchorSite || guide.area}.`}</span>
            </div>
          </div>

          {/* Living Corridor Layer B — About This Place */}
          <AboutThisPlace corridorId={guide.corridorId} />

          {/* Experience schedule */}
          <div className="guide-schedule-section">
            <p className="schedule-heading">Experience schedule</p>
            <div className="schedule-timeline">
              {(details.stops || []).map((stop, i) => (
                <div key={i} className={`schedule-item ${stop.type === 'meetup' ? 'meetup' : ''}`}>
                  <span className="schedule-time">{stop.time}</span>
                  <span className="schedule-activity">
                    <span className="schedule-icon">{renderStopIcon(stop.type)}</span>
                    <span>{stop.activity}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* What to bring */}
          {details.whatToBring?.length > 0 && (
            <div className="what-to-bring-box">
              <p className="box-heading">What to bring</p>
              <ul>
                {details.whatToBring.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          )}

          {/* Cultural etiquette tip */}
          {details.etiquette && (
            <div className="cultural-tip-box">
              <Info size={15} aria-hidden="true" />
              <div>
                <strong>Cultural tip:</strong> {details.etiquette}
              </div>
            </div>
          )}

          {/* Living Corridor Layer A — rotating cultural facts */}
          <div className="corridor-fact" style={{ marginTop: '0.4rem' }}>
            <RotatingFacts activeSite={guide?.corridorId || null} />
          </div>
        </div>

        {/* Right Sub-Column: Trust, Escrow & Checkout */}
        <div className="guide-booking-col">
          <div className="guide-detail-card trust-card">
            <ShieldCheck size={17} aria-hidden="true" />
            <div>
              <strong>Why trust this match</strong>
              <span>
                Identity and Mobile Money wallet reviewed for the Kwan pilot.
                {guide.ghanaCard ? ` Ghana Card on file: ${guide.ghanaCard.slice(0, 7)}•••` : ''}
              </span>
            </div>
          </div>

          <div className="guide-detail-card money-card">
            <WalletCards size={17} aria-hidden="true" />
            <div>
              <strong>Where your money goes</strong>
              <span>
                {formatUsd(serverPricing.host_payout_usd)} is reserved for the host via {guide.momoNetwork || 'Mobile Money'};
                Kwan's {formatUsd(serverPricing.platform_fee_usd)} fee and the {formatUsd(serverPricing.tourism_levy_usd)} levy are shown upfront.
              </span>
            </div>
          </div>

          {/* Optional ceremony add-on */}
          <div className="addon-card">
            <div className="addon-header">
              <span className="addon-title">Optional Cultural Ceremony</span>
              <button
                type="button"
                className={`addon-toggle-btn ${addonIncluded ? 'active' : ''}`}
                onClick={onToggleAddon}
                disabled={isRecalculating}
              >
                {isRecalculating && <Loader2 size={11} className="spin-icon" />}
                {addonIncluded ? 'Remove Stop (-$15)' : 'Add Ceremony (+$15)'}
              </button>
            </div>
            <p className="addon-desc">
              {addonIncluded
                ? 'Customised with ancestral ceremony; price recalculated.'
                : 'Add an optional ceremony and Kwan will recalculate the total before checkout.'}
            </p>
          </div>

          {/* Price summary & CTA */}
          <div className="booking-cta-card">
            <div className="price-row">
              <div className="price-label">
                <span>Total amount</span>
                <span className="price-subtext">{addonIncluded ? 'Includes ceremony' : 'Standard experience'}</span>
              </div>
              <strong className="price-amount">{formatUsd(serverPricing.total_usd)}</strong>
            </div>

            <p className="price-help">
              90% ({formatUsd(serverPricing.host_payout_usd)}) disbursed directly to {guide.momoNetwork || 'Mobile Money'} upon 4-digit PIN verification.
              Includes statutory 1% Ghana Tourism Levy ({formatUsd(serverPricing.tourism_levy_usd)}).
            </p>

            <div className="policy-box">
              <p><strong>Availability:</strong> Pilot team confirms host schedule within hours.</p>
              {details.cancellation && (
                <p><strong>Cancellation:</strong> {details.cancellation}</p>
              )}
            </div>

            <button className="button button-primary button-full" type="button" onClick={onRequestPayment}>
              Request payment link <ArrowUpRight size={17} aria-hidden="true" />
            </button>

            {onReset && (
              <button type="button" className="reset-match" onClick={onReset}>
                <Plus size={14} aria-hidden="true" /> Start a new request
              </button>
            )}
          </div>
        </div>
      </div>
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
  onSimulateEscrowLock,
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {isOfflineMode ? (
                <button className="button button-primary button-full" type="button" onClick={onSimulateDemoPayment}>
                  <WalletCards size={18} aria-hidden="true" /> Simulate payment & Escrow Lock (Demo)
                </button>
              ) : (
                <>
                  <button className="button button-primary button-full" type="button" onClick={onOpenPaystackCheckout}>
                    <WalletCards size={18} aria-hidden="true" /> Open Paystack checkout ↗
                  </button>

                  <button
                    className="button button-full"
                    type="button"
                    onClick={onSimulateEscrowLock}
                    disabled={loadingAction === 'simulating_escrow'}
                    style={{
                      background: 'rgba(33, 71, 52, 0.08)',
                      color: '#214734',
                      border: '1px solid rgba(33, 71, 52, 0.25)',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      padding: '0.65rem 1rem',
                      fontSize: '0.85rem',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    {loadingAction === 'simulating_escrow' ? (
                      <><Loader2 size={16} className="spin-icon" /> Locking escrow funds...</>
                    ) : (
                      <><LockKeyhole size={14} aria-hidden="true" /> Simulate Escrow Lock (Instant Sandbox Test)</>
                    )}
                  </button>

                  <button
                    type="button"
                    className="text-button"
                    onClick={onCheckStatus}
                    disabled={loadingAction === 'polling'}
                    style={{ fontSize: '0.78rem', color: '#647067', alignSelf: 'center', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}
                  >
                    <RefreshCw size={13} className={loadingAction === 'polling' ? 'spin-icon' : ''} /> I completed payment on Paystack — check status
                  </button>
                </>
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
                  <p style={{ fontWeight: 700, color: '#214734', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Smartphone size={14} aria-hidden="true" />
                    <span>Guide will contact you</span>
                  </p>
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
        <h1>Sankofa Plan</h1>
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
        <BookOpen size={13} aria-hidden="true" />
        <span>Before your experience · Living Corridor</span>
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
