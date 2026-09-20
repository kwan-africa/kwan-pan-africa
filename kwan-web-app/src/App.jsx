import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Copy,
  MapPin,
  MessageCircle,
  ShieldCheck,
  WalletCards,
  X,
} from 'lucide-react';

const PILOT_HOSTS = [
  {
    id: 'nana',
    name: 'Nana Kwesi Mensah',
    role: 'Ancestral roots guide and castle historian',
    area: 'Cape Coast Castle, Central Region',
    price: 50,
    initials: 'NM',
    color: 'ochre',
    theme: 'heritage/spiritual',
    anchorSite: 'Cape Coast Castle (Door of No Return)',
    image: '/ghana_guide_kwesi.jpg',
    keywords: ['spiritual', 'roots', 'ancestral', 'cape coast', 'castle', 'pilgrimage', 'door of no return', 'reconnect', 'fante', 'shrine'],
    match: 'Your request is an exact match for an ancestral diaspora pilgrimage.',
  },
  {
    id: 'joshua',
    name: 'Joshua Clottey',
    role: 'Boxing coach and Ga-Mashie walking host',
    area: 'Bukom, Jamestown',
    price: 50,
    initials: 'JC',
    color: 'ochre',
    theme: 'adventure',
    anchorSite: 'Bukom Boxing Academies',
    image: '/ghana_guide_kwesi.jpg',
    keywords: ['boxing', 'bukom', 'jamestown', 'ga-mashie', 'fitness', 'street', 'adventure'],
    match: 'Your request centres on Bukom and street-level culture.',
  },
  {
    id: 'naa',
    name: 'Naa Densua Addy',
    role: 'Bead maker and cultural host',
    area: 'Jamestown, Accra',
    price: 45,
    initials: 'NA',
    color: 'clay',
    theme: 'art',
    anchorSite: 'Ga-Mashie Heritage Bead Guild',
    image: '/kwan_logo_square_white_bg.png',
    keywords: ['bead', 'craft', 'art', 'kenkey', 'maker', 'fashion'],
    match: 'Your request is a close fit for a hands-on craft experience.',
  },
  {
    id: 'kwesi',
    name: 'Kwesi Amponsah',
    role: 'Pan-African history guide',
    area: 'High Street, Accra',
    price: 50,
    initials: 'KA',
    color: 'forest',
    theme: 'heritage/spiritual',
    anchorSite: 'Kwame Nkrumah Memorial Park',
    image: '/ghana_guide_kwesi.jpg',
    keywords: ['history', 'nkrumah', 'independence', 'heritage', 'pan-african', 'museum'],
    match: 'Your request prioritises Ghanaian history and Pan-African context.',
  },
  {
    id: 'kofi',
    name: 'Kofi Asare',
    role: 'Botanical guide and cocoa grower',
    area: 'Aburi, Eastern Region',
    price: 50,
    initials: 'KA',
    color: 'sky',
    theme: 'adventure',
    anchorSite: 'Aburi Botanical Gardens (1890)',
    image: '/ghana_guide_kwesi.jpg',
    keywords: ['aburi', 'nature', 'garden', 'botanical', 'cocoa', 'hike', 'herbal'],
    match: 'Your request is a strong match for an outdoor, plant-led visit.',
  },
];

const THEME_OPTIONS = [
  { tag: 'heritage/spiritual', label: 'Heritage / Spiritual', defaultQuery: 'a spiritual journey to reconnect with my roots' },
  { tag: 'adventure', label: 'Adventure / Boxing', defaultQuery: 'morning boxing session and walking tour in Bukom' },
  { tag: 'art', label: 'Art / Bead Crafts', defaultQuery: 'hands-on bead making and local crafts in Jamestown' },
  { tag: 'food', label: 'Food / Culinary', defaultQuery: 'traditional chop bars and street food tour' },
];

const EXAMPLES = [
  'a spiritual journey to reconnect with my roots',
  'I want a morning boxing session and local food in Jamestown.',
  'I am visiting for heritage and want to understand independence history.',
  'I want a calm Aburi garden and cocoa experience this weekend.',
];

const formatUsd = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

function matchGuide(request) {
  const words = request.toLowerCase();
  const scored = PILOT_HOSTS.map((host) => ({
    host,
    score: host.keywords.reduce((score, keyword) => score + (words.includes(keyword) ? 2 : 0), 0),
  })).sort((a, b) => b.score - a.score);

  return scored[0].score ? scored[0].host : PILOT_HOSTS[0];
}

export default function App() {
  const [request, setRequest] = useState('');
  const [conversation, setConversation] = useState([
    {
      role: 'kwan',
      copy: 'Tell Kwan what you want to do in Accra or Cape Coast. We will return one verified local guide from the pilot roster - not a list, and not a generic generated itinerary.',
    },
  ]);
  const [guide, setGuide] = useState(null);
  const [addonIncluded, setAddonIncluded] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState('details');
  const [traveler, setTraveler] = useState({ name: '', email: '' });
  const [booking, setBooking] = useState(null);
  const [copied, setCopied] = useState(false);
  const [enteredPin, setEnteredPin] = useState('8294');
  const requestInput = useRef(null);

  const effectivePrice = guide ? guide.price + (addonIncluded ? 15 : 0) : 50;

  const paymentLink = useMemo(
    () => `kwan.test/pay/${guide?.id ?? 'pilot'}-${booking?.reference ?? 'preview'}`,
    [guide, booking],
  );

  useEffect(() => {
    if (guide) requestInput.current?.focus();
  }, [guide]);

  function sendRequest(value = request) {
    const trimmed = value.trim();
    if (!trimmed || isMatching) return;

    setConversation((items) => [...items, { role: 'traveler', copy: trimmed }]);
    setRequest('');
    setGuide(null);
    setAddonIncluded(false);
    setIsMatching(true);

    window.setTimeout(() => {
      const matchedGuide = matchGuide(trimmed);
      setGuide(matchedGuide);
      setConversation((items) => [
        ...items,
        {
          role: 'kwan',
          copy: `${matchedGuide.match} I matched you with ${matchedGuide.name} (Anchor: ${matchedGuide.anchorSite}). This is the verified guide Kwan recommends for this journey.`,
        },
      ]);
      setIsMatching(false);
    }, 520);
  }

  function openCheckout() {
    setCheckoutStep('details');
    setBooking(null);
    setCopied(false);
    setCheckoutOpen(true);
  }

  function createPaymentPreview(event) {
    event.preventDefault();
    if (!traveler.name.trim() || !traveler.email.trim()) return;
    setBooking({
      reference: `KWT-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
      status: 'link-ready',
      traveler: traveler.name.trim(),
      pin: '8294',
    });
    setCheckoutStep('payment');
  }

  function markPaid() {
    setBooking((current) => ({ ...current, status: 'held' }));
    setCheckoutStep('confirmed');
  }

  function releasePayout() {
    setBooking((current) => ({ ...current, status: 'released' }));
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
        <a className="brand" href="#top" aria-label="Kwan home">
          <img 
            src="/kwan_logo_square_white_bg.png" 
            alt="Kwan" 
            style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'contain', border: '1px solid #dfddd2' }} 
          />
          <span>Kwan</span>
        </a>
        <p className="pilot-label">Accra & Cape Coast pilot · 2026</p>
      </header>

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
                  <p>Looking through the pilot roster<span className="dot-dot-dot">...</span></p>
                </div>
              )}
            </div>

            {/* Curated Theme Selectors */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.72rem', color: '#94A3B8', alignSelf: 'center', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                Themes:
              </span>
              {THEME_OPTIONS.map((theme) => (
                <button
                  key={theme.tag}
                  className="text-button"
                  style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)' }}
                  type="button"
                  onClick={() => sendRequest(theme.defaultQuery)}
                >
                  {theme.label}
                </button>
              ))}
            </div>

            <div className="example-list" aria-label="Example requests">
              {EXAMPLES.map((example) => (
                <button className="text-button" type="button" key={example} onClick={() => sendRequest(example)}>
                  {example}
                  <ChevronRight size={15} aria-hidden="true" />
                </button>
              ))}
            </div>

            <form className="request-form" onSubmit={(event) => { event.preventDefault(); sendRequest(); }}>
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
                  Find my guide <ArrowUpRight size={17} aria-hidden="true" />
                </button>
              </div>
            </form>
          </div>

          <aside className="match-panel" aria-live="polite">
            {guide ? (
              <GuideMatch 
                guide={guide} 
                effectivePrice={effectivePrice}
                addonIncluded={addonIncluded}
                onToggleAddon={() => setAddonIncluded(prev => !prev)}
                onRequestPayment={openCheckout} 
              />
            ) : (
              <div className="empty-match">
                <div className="empty-icon"><MapPin size={22} aria-hidden="true" /></div>
                <p className="section-kicker">Your match</p>
                <h2>One considered recommendation.</h2>
                <p>Kwan uses the interests in your message to select one guide from the small pilot roster.</p>
              </div>
            )}
          </aside>
        </section>

        <section className="how-it-works" aria-labelledby="flow-heading">
          <p className="section-kicker">How the pilot works</p>
          <h2 id="flow-heading">Built to test trust in one simple flow.</h2>
          <ol>
            <li><span>01</span><p>Describe the day you want.</p></li>
            <li><span>02</span><p>Receive one guide match and lock funds in escrow.</p></li>
            <li><span>03</span><p>Share your 4-digit PIN after the experience to trigger the sub-60s Mobile Money payout.</p></li>
          </ol>
        </section>
      </main>

      <footer>
        <span>Kwan pilot prototype</span>
        <span>Sample data only. Escrow simulation captures the statutory 1% Ghana Tourism Levy (Act 817).</span>
      </footer>

      {checkoutOpen && guide && (
        <CheckoutModal
          guide={guide}
          effectivePrice={effectivePrice}
          traveler={traveler}
          setTraveler={setTraveler}
          step={checkoutStep}
          booking={booking}
          paymentLink={paymentLink}
          copied={copied}
          enteredPin={enteredPin}
          setEnteredPin={setEnteredPin}
          onClose={() => setCheckoutOpen(false)}
          onCreatePaymentPreview={createPaymentPreview}
          onCopyLink={copyLink}
          onMarkPaid={markPaid}
          onReleasePayout={releasePayout}
        />
      )}
    </div>
  );
}

function GuideMatch({ guide, effectivePrice, addonIncluded, onToggleAddon, onRequestPayment }) {
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
      <p className="section-kicker">Your guide match · {guide.theme || 'heritage'}</p>
      <h2>{guide.name}</h2>
      <p className="guide-role">{guide.role}</p>
      <div className="guide-detail"><MapPin size={17} aria-hidden="true" /><span>{guide.area}</span></div>
      
      {guide.anchorSite && (
        <div className="reviewed-note" style={{ color: '#F5A623', background: 'rgba(245, 166, 35, 0.08)' }}>
          <CheckCircle2 size={17} aria-hidden="true" />
          <span>Anchor site: {guide.anchorSite}</span>
        </div>
      )}

      {/* Edit Action to live-recalculate price */}
      <div style={{ margin: '0.8rem 0', padding: '0.6rem 0.8rem', background: 'rgba(255,255,255,0.04)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.82rem' }}>Optional Cultural Stop / Ceremony</span>
          <button 
            type="button" 
            onClick={onToggleAddon}
            style={{ 
              padding: '0.2rem 0.55rem', 
              fontSize: '0.72rem', 
              borderRadius: '4px', 
              cursor: 'pointer', 
              background: addonIncluded ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)', 
              color: addonIncluded ? '#EF4444' : '#10B981', 
              border: `1px solid ${addonIncluded ? '#EF4444' : '#10B981'}` 
            }}
          >
            {addonIncluded ? 'Remove Stop (-$15)' : 'Add Ceremony (+$15)'}
          </button>
        </div>
        <span style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'block', marginTop: '0.2rem' }}>
          {addonIncluded ? 'Customized with ancestral ceremony. Price updated live.' : 'Click to customize stops and live-recalculate pricing.'}
        </span>
      </div>

      <div className="price-row">
        <span>Test booking {addonIncluded && '(edited)'}</span>
        <strong>{formatUsd(effectivePrice)}</strong>
      </div>
      <p className="price-help">One guide, one local experience. 90% ({formatUsd(effectivePrice * 0.9)}) disbursed directly to Mobile Money upon PIN verification.</p>
      <button className="button button-primary button-full" type="button" onClick={onRequestPayment}>
        Request payment link <ArrowUpRight size={17} aria-hidden="true" />
      </button>
    </div>
  );
}

function CheckoutModal({
  guide,
  effectivePrice,
  traveler,
  setTraveler,
  step,
  booking,
  paymentLink,
  copied,
  enteredPin,
  setEnteredPin,
  onClose,
  onCreatePaymentPreview,
  onCopyLink,
  onMarkPaid,
  onReleasePayout,
}) {
  const payout = effectivePrice * 0.9;
  const released = booking?.status === 'released';

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="checkout-modal" role="dialog" aria-modal="true" aria-labelledby="checkout-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="close-button" type="button" onClick={onClose} aria-label="Close payment flow"><X size={20} /></button>
        <div className="checkout-heading">
          <p className="section-kicker">Card-to-Mobile Money Escrow</p>
          <h2 id="checkout-title">
            {step === 'details' && 'Prepare your payment link'}
            {step === 'payment' && 'Your payment link is ready'}
            {step === 'confirmed' && (released ? 'Test payout released' : 'Funds locked in escrow')}
          </h2>
        </div>

        <div className="checkout-summary">
          {guide.image ? (
            <img 
              src={guide.image} 
              alt={guide.name} 
              style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover' }} 
            />
          ) : (
            <div className={`guide-avatar small ${guide.color}`} aria-hidden="true">{guide.initials}</div>
          )}
          <div><strong>{guide.name}</strong><span>{guide.area}</span></div>
          <strong>{formatUsd(effectivePrice)}</strong>
        </div>

        {step === 'details' && (
          <form className="checkout-form" onSubmit={onCreatePaymentPreview}>
            <p>Enter a test traveler profile to generate a single, shareable checkout link.</p>
            <label htmlFor="traveler-name">Your name</label>
            <input id="traveler-name" autoComplete="name" value={traveler.name} onChange={(event) => setTraveler({ ...traveler, name: event.target.value })} required />
            <label htmlFor="traveler-email">Email for the link</label>
            <input id="traveler-email" type="email" autoComplete="email" value={traveler.email} onChange={(event) => setTraveler({ ...traveler, email: event.target.value })} required />
            <div className="prototype-notice"><CircleAlert size={18} aria-hidden="true" /><span>Paystack card checkout simulation: funds are held in regulated escrow.</span></div>
            <button className="button button-primary button-full" type="submit">Generate payment-link preview <ArrowUpRight size={17} aria-hidden="true" /></button>
          </form>
        )}

        {step === 'payment' && (
          <div className="payment-preview">
            <p className="link-label">Unique payment link</p>
            <div className="link-box"><span>{paymentLink}</span><button type="button" onClick={onCopyLink} aria-label="Copy payment link">{copied ? <Check size={17} /> : <Copy size={17} />}</button></div>
            <p className="reference">Reference: {booking.reference}</p>
            <div className="prototype-notice"><CircleAlert size={18} aria-hidden="true" /><span>Paystack simulated card payment: locks funds into escrow and creates 4-digit release PIN.</span></div>
            <button className="button button-primary button-full" type="button" onClick={onMarkPaid}><WalletCards size={18} aria-hidden="true" /> Record test payment into escrow</button>
          </div>
        )}

        {step === 'confirmed' && (
          <div className="confirmation">
            <div className={`confirmation-mark ${released ? 'released' : ''}`}><CheckCircle2 size={31} aria-hidden="true" /></div>
            
            {!released ? (
              <>
                <p><strong>{formatUsd(effectivePrice)}</strong> is locked in escrow for {guide.name}.</p>
                <div style={{ margin: '1rem 0', padding: '0.9rem', background: 'rgba(245, 166, 35, 0.1)', border: '1px solid #F5A623', borderRadius: '6px', textAlign: 'center' }}>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: '#F5A623', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                    Traveler 4-Digit Release PIN
                  </span>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', letterSpacing: '4px', fontFamily: 'monospace' }}>
                    {booking?.pin || '8294'}
                  </span>
                  <span style={{ display: 'block', fontSize: '0.72rem', color: '#CBD5E1', marginTop: '0.3rem' }}>
                    Share this code with your host only after the experience is complete.
                  </span>
                </div>

                <div className="release-rule" style={{ marginBottom: '1rem' }}>
                  <CalendarDays size={18} aria-hidden="true" />
                  <span>Host payout step: enter the traveler's 4-digit PIN to release Mobile Money funds.</span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.8rem' }}>
                  <input 
                    type="text" 
                    value={enteredPin} 
                    onChange={(e) => setEnteredPin(e.target.value)} 
                    placeholder="Enter 4-digit PIN"
                    maxLength={4}
                    style={{ textAlign: 'center', letterSpacing: '3px', fontWeight: 700, fontFamily: 'monospace', width: '120px' }}
                  />
                  <button 
                    className="button button-primary" 
                    style={{ flex: 1 }} 
                    type="button" 
                    onClick={onReleasePayout}
                    disabled={enteredPin !== (booking?.pin || '8294')}
                  >
                    Verify PIN & Release {formatUsd(payout)}
                  </button>
                </div>
              </>
            ) : (
              <div>
                <p><strong>{formatUsd(payout)}</strong> released to {guide.name}'s MTN Mobile Money wallet.</p>
                <p className="quiet-confirmation" style={{ color: '#10B981', marginTop: '0.5rem' }}>
                  PIN verified. Reference {booking.reference} · 90% payout settled in 32.4s · 1% Tourism Levy remitted.
                </p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
