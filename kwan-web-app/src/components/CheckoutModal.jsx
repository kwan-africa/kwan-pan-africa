import React, { useState } from 'react';
import { X, Lock, CreditCard, CheckCircle2, ShieldCheck, Copy, Check, ArrowRight, Users, Plus, Minus } from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatPrice } from '../data/culturalKnowledge';

export default function CheckoutModal({ itinerary, onClose, onBookingSuccess, onNavigateToPayout, currency = 'USD' }) {
  const [step, setStep] = useState('payment'); // 'payment' | 'confirmed'
  const [adultCount, setAdultCount] = useState(1);
  const [childCount, setChildCount] = useState(0);
  const [cardNumber, setCardNumber] = useState('4084 0848 0848 0848');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('408');
  const [travelerName, setTravelerName] = useState('Marcus Adebayo');
  const [generatedPin, setGeneratedPin] = useState('');
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!itinerary) return null;

  // Guest units: Adult = 1.0, Child = 0.5 (50% discount)
  const effectiveUnits = adultCount + (childCount * 0.5);
  const basePriceUsd = itinerary.pricing.totalUsd;
  const calculatedTotalUsd = Math.round(basePriceUsd * effectiveUnits * 100) / 100;
  const calculatedHostMoMoUsd = Math.round(calculatedTotalUsd * 0.90 * 100) / 100;
  const calculatedKwanFeeUsd = Math.round(calculatedTotalUsd * 0.10 * 100) / 100;
  const calculatedLevyUsd = Math.round(calculatedTotalUsd * 0.01 * 100) / 100;

  const handlePay = () => {
    setIsProcessing(true);

    setTimeout(() => {
      // Generate 4-digit PIN
      const pin = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedPin(pin);

      const bookingRecord = {
        id: `KWN-${Math.floor(100000 + Math.random() * 900000)}`,
        travelerName,
        title: itinerary.title,
        adults: adultCount,
        children: childCount,
        totalAmountUsd: calculatedTotalUsd,
        hostPayoutUsd: calculatedHostMoMoUsd,
        kwanFeeUsd: calculatedKwanFeeUsd,
        levyUsd: calculatedLevyUsd,
        pin,
        status: 'ESCROW_LOCKED',
        createdAt: new Date().toISOString(),
        stops: itinerary.stops
      };

      onBookingSuccess(bookingRecord);
      setIsProcessing(false);
      setStep('confirmed');

      // Celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // Safe confetti fallback
      }
    }, 1200);
  };

  const copyPin = () => {
    navigator.clipboard.writeText(generatedPin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 7, 12, 0.82)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div className="glass-card animate-fade-in" style={{
        width: '100%',
        maxWidth: '540px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.8rem',
        position: 'relative',
        boxShadow: '0 25px 60px -15px rgba(0,0,0,0.8)',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {/* Close button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.2rem',
            right: '1.2rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '0.4rem',
            borderRadius: '50%'
          }}
        >
          <X size={20} />
        </button>

        {step === 'payment' ? (
          <div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <div style={{
                background: 'var(--gold-dim)',
                color: 'var(--gold)',
                padding: '0.5rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex'
              }}>
                <Lock size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.3rem', color: 'var(--text-white)' }}>Paystack Escrow Vault</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Funds held in trust · Released via 4-Digit Private PIN
                </span>
              </div>
            </div>

            {/* Trip Summary Pill */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.9rem',
              margin: '1rem 0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Itinerary Package</span>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-white)', fontFamily: 'var(--font-mono)' }}>
                  {formatPrice(calculatedTotalUsd, currency)}
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {itinerary.title}
              </p>
              <div style={{ fontSize: '0.75rem', color: 'var(--green)', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <ShieldCheck size={12} /> 90% ({formatPrice(calculatedHostMoMoUsd, currency)}) reserved for verified grassroots hosts
              </div>
            </div>

            {/* Guest Selection Counters */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.8rem 1rem',
              marginBottom: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={16} style={{ color: 'var(--gold)' }} />
                <div>
                  <span style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-white)', fontWeight: 600 }}>
                    Party Size
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Children receive 50% discount
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                {/* Adults */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Adult:</span>
                  <div className="counter-control">
                    <button 
                      type="button" 
                      className="counter-btn"
                      disabled={adultCount <= 1}
                      onClick={() => setAdultCount(prev => Math.max(1, prev - 1))}
                    >
                      <Minus size={12} />
                    </button>
                    <span className="counter-value">{adultCount}</span>
                    <button 
                      type="button" 
                      className="counter-btn"
                      disabled={adultCount >= 10}
                      onClick={() => setAdultCount(prev => Math.min(10, prev + 1))}
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>

                {/* Children */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Child:</span>
                  <div className="counter-control">
                    <button 
                      type="button" 
                      className="counter-btn"
                      disabled={childCount <= 0}
                      onClick={() => setChildCount(prev => Math.max(0, prev - 1))}
                    >
                      <Minus size={12} />
                    </button>
                    <span className="counter-value">{childCount}</span>
                    <button 
                      type="button" 
                      className="counter-btn"
                      disabled={childCount >= 8}
                      onClick={() => setChildCount(prev => Math.min(8, prev + 1))}
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                  Traveler Full Name
                </label>
                <input 
                  type="text"
                  value={travelerName}
                  onChange={(e) => setTravelerName(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.7rem 0.9rem',
                    color: 'var(--text-white)',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                  International Card Number (Paystack Test Mode)
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.7rem 0.9rem',
                      color: 'var(--text-white)',
                      fontSize: '0.95rem',
                      fontFamily: 'var(--font-mono)'
                    }}
                  />
                  <CreditCard size={18} style={{ position: 'absolute', right: '12px', top: '13px', color: 'var(--gold)' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                    Expiry
                  </label>
                  <input 
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.7rem 0.9rem',
                      color: 'var(--text-white)',
                      fontSize: '0.95rem',
                      fontFamily: 'var(--font-mono)'
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                    CVC
                  </label>
                  <input 
                    type="text"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.7rem 0.9rem',
                      color: 'var(--text-white)',
                      fontSize: '0.95rem',
                      fontFamily: 'var(--font-mono)'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Pay Button */}
            <button 
              onClick={handlePay}
              disabled={isProcessing}
              className="btn btn-gold"
              style={{ width: '100%', marginTop: '1.2rem', fontSize: '1.05rem', padding: '0.85rem' }}
            >
              {isProcessing ? (
                <span>Locking Funds in Paystack Escrow...</span>
              ) : (
                <>
                  <span>Lock Funds & Issue PIN ({formatPrice(calculatedTotalUsd, currency)})</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        ) : (
          /* CONFIRMED SCREEN */
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--green-dim)',
              color: 'var(--green)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto'
            }}>
              <CheckCircle2 size={36} />
            </div>

            <h3 style={{ fontSize: '1.4rem', color: 'var(--text-white)', marginBottom: '0.3rem' }}>
              Funds Secured in Escrow!
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.2rem' }}>
              Your card has been charged <strong style={{ color: '#FFF' }}>{formatPrice(calculatedTotalUsd, currency)}</strong>. Funds are locked until you authorize release.
            </p>

            {/* PIN Card */}
            <div style={{
              background: 'rgba(245, 166, 35, 0.08)',
              border: '2px dashed var(--gold)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.3rem',
              marginBottom: '1.2rem'
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--gold)', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase' }}>
                YOUR PRIVATE 4-DIGIT VERIFICATION CODE
              </span>
              <div style={{
                fontSize: '3.2rem',
                fontWeight: 900,
                color: 'var(--text-white)',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.25em',
                margin: '0.3rem 0'
              }}>
                {generatedPin}
              </div>
              <button 
                onClick={copyPin}
                className="btn btn-outline"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? 'Copied to Clipboard' : 'Copy 4-Digit Code'}</span>
              </button>
            </div>

            {/* Instructions */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem',
              textAlign: 'left',
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
              marginBottom: '1.2rem'
            }}>
              <p style={{ marginBottom: '0.3rem' }}>
                🔒 <strong>How the Escrow Works:</strong>
              </p>
              <p>
                1. Enjoy your journey with your assigned grassroots hosts.<br/>
                2. When you finish, share this 4-digit code with your host.<br/>
                3. The host enters the PIN into their Kwan Terminal, triggering <strong>instant Mobile Money disbursement</strong> to their phone.
              </p>
            </div>

            {/* Handoff Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <button 
                onClick={() => {
                  if (onNavigateToPayout) {
                    onNavigateToPayout(generatedPin);
                  } else {
                    onClose();
                  }
                }}
                className="btn btn-green"
                style={{ width: '100%', fontSize: '0.98rem' }}
              >
                <span>Redeem in Host MoMo Terminal</span>
                <ArrowRight size={18} />
              </button>

              <button 
                onClick={onClose}
                className="btn btn-outline"
                style={{ width: '100%', fontSize: '0.88rem' }}
              >
                Done & Return to Trip
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
