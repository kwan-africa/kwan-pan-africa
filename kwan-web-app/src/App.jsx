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
  Smartphone,
  WalletCards,
  X,
} from 'lucide-react';

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

const EXPERIENCE_DETAILS = {
  heritage_spiritual: { label: 'Heritage / Spiritual', duration: 'Half-day experience', itinerary: 'Guided heritage walk, cultural context, and time for reflection at the anchor site.' },
  adventure: { label: 'Adventure / Boxing', duration: 'Morning experience', itinerary: 'Warm-up, coached session, and a local walking route around the host neighborhood.' },
  art: { label: 'Art / Bead Crafts', duration: 'Half-day experience', itinerary: 'Hands-on craft session, local maker stories, and a guided walk through the arts compound.' },
};

const formatUsd = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const API_BASE = import.meta.env?.VITE_API_BASE || '/api';

export default function App() {
  const [request, setRequest] = useState('');
  const [conversation, setConversation] = useState([
    {
      role: 'kwan',
      copy: 'Tell Kwan what you want to do in Accra or Cape Coast. We will return one verified local guide from the pilot roster - not a list, and not a generic generated itinerary.',
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
  const requestInput = useRef(null);

  const isMatching = loadingAction === 'matching';
  const effectivePrice = serverPricing.total_usd;

  const paymentLink = useMemo(
    () => `kwanai.me/pay/${guide?.id ?? 'pilot'}-${booking?.reference ?? 'preview'}`,
    [guide, booking],
  );

  useEffect(() => {
    if (guide) requestInput.current?.focus();
  }, [guide]);

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

    try {
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
          image: h.photo_url || '/ghana_guide_kwesi.jpg',
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
          copy: `I matched you with ${matched.name} because their verified roster profile covers ${EXPERIENCE_DETAILS[theme_matched]?.label || theme_matched} experiences near ${matched.anchorSite}.`,
        },
      ]);
    } catch (err) {
      console.error('Backend query failed:', err);
      setGuide(null);
      setErrorMessage(`We could not complete the match: ${err.message}`);
      setConversation((items) => [
        ...items,
        {
          role: 'kwan',
          copy: 'I could not reach the live guide roster. Please try again when the service is available.',
        },
      ]);
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
      const res = await fetch(`${API_BASE}/itinerary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base_price_usd: guide.price,
          addon_included: nextAddon,
        }),
      });

      if (!res.ok) throw new Error('Failed to recalculate itinerary pricing from server.');

      const data = await res.json();
      setAddonIncluded(nextAddon);
      setServerPricing(data);
    } catch (err) {
      console.error('Itinerary recalculation failed:', err);
      setErrorMessage(`Could not update the server-calculated price: ${err.message}`);
    } finally {
      setLoadingAction(null);
    }
  }

  function openCheckout() {
    setCheckoutStep('details');
    setBooking(null);
    setCopied(false);
    setEnteredPin('');
    setPilotConfirmation(false);
    setErrorMessage(null);
    setCheckoutOpen(true);
  }

  function resetMatch() {
    setGuide(null);
    setMatchedTheme(null);
    setAddonIncluded(false);
    setConversation([
      {
        role: 'kwan',
        copy: 'Tell Kwan what you want to do in Accra or Cape Coast. We will return one verified local guide from the pilot roster - not a list, and not a generic generated itinerary.',
      },
    ]);
    setRequest('');
    setErrorMessage(null);
    requestInput.current?.focus();
  }

  async function createPaymentPreview(event) {
    event.preventDefault();
    if (!traveler.name.trim() || !traveler.email.trim()) return;
    if (!experienceDate || !pilotConfirmation) {
      setErrorMessage('Select an experience date and confirm that the pilot team has approved availability before creating a payment link.');
      return;
    }

    setLoadingAction('checkout_init');
    setErrorMessage(null);

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

    try {
      const res = await fetch(`${API_BASE}/escrow/release`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: booking.reference,
          submitted_pin: enteredPin,
        }),
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

  return (
    <div className="site-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Kwan home" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src="/kwan_logo_white_bg.png"
            alt="Kwan Pan-African Travel"
            style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
            onError={(e) => {
              e.target.src = '/kwan_logo_square_white_bg.png';
            }}
          />
        </a>
        <p className="pilot-label">Accra &amp; Cape Coast pilot · 2026</p>
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
        <section className="intro" aria-labelledby="page-title">
          <p className="eyebrow">Grassroots cultural travel</p>
          <h1 id="page-title">One conversation.<br />One local guide.</h1>
          <p className="lede">
            Describe the experience you want in Ghana. Kwan matches you with one local guide and prepares one card payment link.
          </p>
          <div className="method-note">
            <ShieldCheck size={18} aria-hidden="true" />
            <span>Pilot roster: each host is manually identity- and Mobile Money-wallet reviewed before a test booking.</span>
          </div>
        </section>

        <section className="booking-layout" aria-label="Conversation and guide match">
          <div className="conversation-panel">
            <div className="panel-heading">
              <div>
                <p className="section-kicker">Start here</p>
                <h2>What would you like to experience?</h2>
              </div>
              <MessageCircle size={20} aria-hidden="true" />
            </div>

            <div className="messages" aria-live="polite">
              {conversation.map((message, index) => (
                <div className={`message ${message.role}`} key={`${message.role}-${index}`}>
                  <span className="message-label">{message.role === 'kwan' ? 'Kwan' : 'You'}</span>
                  <p>{message.copy}</p>
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

            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
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

            <div className="example-list" aria-label="Example requests">
              <span className="examples-label">Try a starting point</span>
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

          <aside className="match-panel" aria-live="polite">
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
          <p className="section-kicker">How the pilot works</p>
          <h2 id="flow-heading">Built to test trust in one simple flow.</h2>
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
          <span>Kwan pilot · Built for PAAIS 2026</span>
        </div>
        <div className="footer-links">
          <a href="mailto:hello@kwanai.me">Contact the pilot <ExternalLink size={13} aria-hidden="true" /></a>
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
          onClose={() => setCheckoutOpen(false)}
          onCreatePaymentPreview={createPaymentPreview}
          onCopyLink={copyLink}
          onOpenPaystackCheckout={openPaystackCheckout}
          onCheckStatus={checkPaymentStatus}
          onReleasePayout={releasePayout}
        />
      )}
    </div>
  );
}

function GuideMatch({ guide, matchedTheme, serverPricing, addonIncluded, isRecalculating, onToggleAddon, onRequestPayment }) {
  const details = EXPERIENCE_DETAILS[matchedTheme] || EXPERIENCE_DETAILS.heritage_spiritual;
  return (
    <div className="guide-match">
      {guide.image ? (
        <img
          src={guide.image}
          alt={guide.name}
          style={{ width: '68px', height: '68px', borderRadius: '16px', objectFit: 'cover', marginBottom: '16px', border: '2px solid #214734' }}
        />
      ) : (
        <div className={`guide-avatar ${guide.color}`} aria-hidden="true">{guide.initials}</div>
      )}
      <p className="section-kicker">Your guide match · {details.label}</p>
      <h2>{guide.name}</h2>
      <p className="guide-role">{guide.role}</p>
      <div className="guide-detail"><MapPin size={17} aria-hidden="true" /><span>{guide.area}</span></div>
      <div className="experience-summary">
        <div><CalendarDays size={16} aria-hidden="true" /><span>{details.duration}</span></div>
        <p>{details.itinerary}</p>
      </div>
      <div className="reviewed-note" style={{ color: '#214734', background: 'rgba(33,71,52,0.06)' }}>
        <CheckCircle2 size={17} aria-hidden="true" />
        <span>Operator package: fixed experience with one optional ceremony add-on. Review and edit it before payment.</span>
      </div>

      {guide.anchorSite && (
        <div className="reviewed-note" style={{ color: '#F5A623', background: 'rgba(245, 166, 35, 0.08)' }}>
          <CheckCircle2 size={17} aria-hidden="true" />
          <span>Anchor site: {guide.anchorSite}</span>
        </div>
      )}

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
          {addonIncluded ? 'Customized with ancestral ceremony; the server has recalculated your total.' : 'Add an optional ceremony and Kwan will recalculate the total before checkout.'}
        </span>
      </div>

      <div className="price-row">
        <span>Test booking {addonIncluded && '(edited)'}</span>
        <strong>{formatUsd(serverPricing.total_usd)}</strong>
      </div>
      <p className="price-help">
        One guide, one local experience. 90% ({formatUsd(serverPricing.host_payout_usd)}) disbursed directly to Mobile Money upon PIN verification. Includes statutory 1% Ghana Tourism Levy ({formatUsd(serverPricing.tourism_levy_usd)}).
      </p>
      <p className="booking-policy"><strong>Booking note:</strong> Confirm availability with the pilot team before payment. If plans change, contact us before the experience so we can review a refund or reschedule.</p>
      <button className="button button-primary button-full" type="button" onClick={onRequestPayment}>
        Request payment link <ArrowUpRight size={17} aria-hidden="true" />
      </button>
    </div>
  );
}

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
  onClose,
  onCreatePaymentPreview,
  onCopyLink,
  onOpenPaystackCheckout,
  onCheckStatus,
  onReleasePayout,
}) {
  const payout = serverPricing.host_payout_usd;
  const released = booking?.status === 'released';

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="checkout-modal" role="dialog" aria-modal="true" aria-labelledby="checkout-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="close-button" type="button" onClick={onClose} aria-label="Close payment flow"><X size={20} /></button>
        <div className="checkout-heading" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.8rem' }}>
          <div>
            <p className="section-kicker">Card-to-Mobile Money Escrow</p>
            <h2 id="checkout-title">
              {step === 'details' && 'Prepare your payment link'}
              {step === 'payment' && 'Your payment link is ready'}
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

        {step === 'details' && (
          <form className="checkout-form" onSubmit={onCreatePaymentPreview}>
            <p>Review the fixed operator package above, then enter your details. The pilot team must confirm the guide's availability before any payment is authorized.</p>
            <label htmlFor="traveler-name">Your name</label>
            <input id="traveler-name" autoComplete="name" value={traveler.name} onChange={(event) => setTraveler({ ...traveler, name: event.target.value })} required />
            <label htmlFor="traveler-email">Email for the link</label>
            <input id="traveler-email" type="email" autoComplete="email" value={traveler.email} onChange={(event) => setTraveler({ ...traveler, email: event.target.value })} required />
            <label htmlFor="experience-date">Experience date</label>
            <input id="experience-date" type="date" value={experienceDate} min={new Date().toISOString().slice(0, 10)} onChange={(event) => setExperienceDate(event.target.value)} required />
            <label className="confirmation-checkbox" htmlFor="pilot-confirmation">
              <input id="pilot-confirmation" type="checkbox" checked={pilotConfirmation} onChange={(event) => setPilotConfirmation(event.target.checked)} />
              <span>I have received pilot-team confirmation that this guide is available for this date.</span>
            </label>
            <div className="prototype-notice"><CircleAlert size={18} aria-hidden="true" /><span>Paystack sandbox checkout: after the confirmed experience, the traveler shares the release PIN to trigger the host payout.</span></div>
            <button className="button button-primary button-full" type="submit" disabled={loadingAction === 'checkout_init'}>
              {loadingAction === 'checkout_init' ? (
                <><Loader2 size={16} className="spin-icon" /> Creating escrow booking...</>
              ) : (
                <>Create secure payment link <ArrowUpRight size={17} aria-hidden="true" /></>
              )}
            </button>
          </form>
        )}

        {step === 'payment' && (
          <div className="payment-preview">
            <p className="link-label">Unique payment link</p>
            <div className="link-box"><span>{paymentLink}</span><button type="button" onClick={onCopyLink} aria-label="Copy payment link">{copied ? <Check size={17} /> : <Copy size={17} />}</button></div>
            <p className="reference">Reference: {booking.reference}</p>
            <div className="prototype-notice"><CircleAlert size={18} aria-hidden="true" /><span>Availability was acknowledged for {booking.experienceDate}. Complete payment in Paystack; Kwan will then hold the funds and keep the release PIN with you.</span></div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <button className="button button-primary button-full" type="button" onClick={onOpenPaystackCheckout}>
                <WalletCards size={18} aria-hidden="true" /> Open Paystack checkout
              </button>

              <button
                type="button"
                className="text-button"
                onClick={onCheckStatus}
                disabled={loadingAction === 'polling'}
                style={{ fontSize: '0.78rem', color: '#647067', alignSelf: 'center', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <RefreshCw size={13} className={loadingAction === 'polling' ? 'spin-icon' : ''} /> I completed payment — check status
              </button>
            </div>
          </div>
        )}

        {step === 'confirmed' && (
          <div className="confirmation">
            <div className={`confirmation-mark ${released ? 'released' : ''}`}><CheckCircle2 size={31} aria-hidden="true" /></div>

            {!released ? (
              <>
                <p><strong>{formatUsd(serverPricing.total_usd)}</strong> is locked in escrow for {guide.name} on {booking.experienceDate}.</p>
                <div style={{ margin: '1rem 0', padding: '0.9rem', background: 'rgba(245, 166, 35, 0.08)', border: '1px solid #F5A623', borderRadius: '6px', textAlign: 'center' }}>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: '#F5A623', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                    Traveler 4-Digit Release PIN
                  </span>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1b2921', letterSpacing: '4px', fontFamily: 'monospace' }}>
                    {booking?.pin || '----'}
                  </span>
                  <span style={{ display: 'block', fontSize: '0.72rem', color: '#647067', marginTop: '0.3rem' }}>
                    Share this code with your host only after the experience is complete.
                  </span>
                  <button type="button" className="text-button" onClick={() => navigator.clipboard.writeText(booking?.pin || '')} style={{ margin: '0.4rem auto 0', color: '#8e5c19' }}>
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
                <p><strong>{formatUsd(payout)}</strong> released to {guide.name}'s MTN Mobile Money wallet.</p>
                <p className="quiet-confirmation" style={{ color: '#214734', marginTop: '0.5rem' }}>
                  PIN verified. Reference {booking.reference} · 90% payout settled in 32.4s · 1% Tourism Levy ({formatUsd(serverPricing.tourism_levy_usd)}) remitted.
                </p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
