import React, { useState } from 'react';
import { Smartphone, ShieldCheck, CheckCircle2, AlertCircle, Lock, History } from 'lucide-react';
import confetti from 'canvas-confetti';
import { VERIFIED_HOSTS, formatPrice, FX_USD_TO_GHS } from '../data/culturalKnowledge';

export default function PayoutTerminal({ escrowBookings, onReleasePayout, currency = 'USD', prefilledPin = '' }) {
  const [selectedHostId, setSelectedHostId] = useState(VERIFIED_HOSTS[0].id);
  const [enteredPin, setEnteredPin] = useState(prefilledPin || '');
  const [prevPrefilledPin, setPrevPrefilledPin] = useState(prefilledPin);
  const [errorMsg, setErrorMsg] = useState('');
  const [successReceipt, setSuccessReceipt] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Synchronize state during render when prefilledPin changes from outside
  if (prefilledPin !== prevPrefilledPin) {
    setPrevPrefilledPin(prefilledPin);
    setEnteredPin(prefilledPin);
  }

  const selectedHost = VERIFIED_HOSTS.find(h => h.id === selectedHostId) || VERIFIED_HOSTS[0];

  const handleVerifyAndDisburse = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessReceipt(null);

    if (enteredPin.length !== 4) {
      setErrorMsg('Please enter a valid 4-digit verification PIN.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // Find matching escrow booking
      const matchedBooking = escrowBookings.find(b => b.pin === enteredPin && b.status === 'ESCROW_LOCKED');

      if (!matchedBooking) {
        setIsSubmitting(false);
        setErrorMsg('Invalid or already claimed PIN. Please check the code with your traveler.');
        return;
      }

      // Successful release
      const receipt = {
        bookingId: matchedBooking.id,
        travelerName: matchedBooking.travelerName,
        hostName: selectedHost.name,
        momoNetwork: selectedHost.momoNetwork,
        momoNumber: selectedHost.momoNumber,
        ghanaCard: selectedHost.ghanaCard,
        payoutUsd: matchedBooking.hostPayoutUsd,
        payoutGhs: (matchedBooking.hostPayoutUsd * FX_USD_TO_GHS).toFixed(2),
        txRef: `MOMO-GH-${Math.floor(100000000 + Math.random() * 900000000)}`,
        timestamp: new Date().toLocaleTimeString(),
        levyRemittedGhs: (matchedBooking.levyUsd * FX_USD_TO_GHS).toFixed(2)
      };

      onReleasePayout(matchedBooking.id);
      setIsSubmitting(false);
      setSuccessReceipt(receipt);
      setEnteredPin('');

      // Confetti celebration
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 }
        });
      } catch {
        // Safe confetti fallback
      }

    }, 1000);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
        <div className="badge badge-green" style={{ marginBottom: '0.6rem' }}>
          <Smartphone size={14} /> LIVE SETTLEMENT ENGINE
        </div>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--text-white)' }}>
          Host Mobile Money Payout Terminal
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '550px', margin: '0.3rem auto 0 auto' }}>
          Grassroots African hosts enter the traveler's 4-digit code to trigger sub-60s instant disbursement to their MTN MoMo or Telecel Cash.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
        {/* Left: Terminal Input Card */}
        <div className="glass-card" style={{ border: '1px solid var(--border-medium)' }}>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--text-white)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={18} style={{ color: 'var(--gold)' }} />
            <span>Enter Escrow Release PIN</span>
          </h3>

          <form onSubmit={handleVerifyAndDisburse} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Host Identity Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                Select Active Host Terminal
              </label>
              <select
                value={selectedHostId}
                onChange={(e) => setSelectedHostId(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.7rem 0.9rem',
                  color: 'var(--text-white)',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              >
                {VERIFIED_HOSTS.map(h => (
                  <option key={h.id} value={h.id} style={{ background: '#121622', color: '#FFF' }}>
                    {h.name} ({h.momoNetwork})
                  </option>
                ))}
              </select>
            </div>

            {/* Host Card Mini Badge */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.82rem'
            }}>
              <div>
                <span style={{ display: 'block', color: 'var(--text-white)', fontWeight: 600 }}>
                  {selectedHost.name}
                </span>
                <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                  {selectedHost.momoNumber} ({selectedHost.momoNetwork})
                </span>
              </div>
              <span className="badge badge-green" style={{ fontSize: '0.68rem', padding: '0.15rem 0.4rem' }}>
                <ShieldCheck size={11} /> {selectedHost.ghanaCard}
              </span>
            </div>

            {/* PIN Input */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                  Traveler 4-Digit Release PIN
                </label>
                {prefilledPin && enteredPin === prefilledPin && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--gold)', fontFamily: 'var(--font-mono)' }}>
                    ✨ Auto-filled from Checkout
                  </span>
                )}
              </div>
              <input
                type="text"
                maxLength={4}
                value={enteredPin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setEnteredPin(val);
                }}
                placeholder="4921"
                style={{
                  width: '100%',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.8rem',
                  color: 'var(--text-white)',
                  fontSize: '2rem',
                  fontWeight: 900,
                  textAlign: 'center',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.3em',
                  outline: 'none'
                }}
              />
            </div>

            {errorMsg && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#EF4444',
                padding: '0.6rem 0.8rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <AlertCircle size={15} />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || enteredPin.length !== 4}
              className="btn btn-green"
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '1rem',
                opacity: (isSubmitting || enteredPin.length !== 4) ? 0.6 : 1
              }}
            >
              {isSubmitting ? (
                <span>Disbursing via Mobile Money API...</span>
              ) : (
                <span>Disburse Instant MoMo Payout</span>
              )}
            </button>
          </form>
        </div>

        {/* Right: Live Balance & Settlement Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          
          {/* Host Wallet Overview Card */}
          <div className="glass-card" style={{ border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                HOST DIRECT BALANCE
              </span>
              <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
                AVERAGE 3.9X LIVING WAGE
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--text-white)', fontFamily: 'var(--font-mono)' }}>
                {formatPrice(315, currency)}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--green)', fontWeight: 700 }}>
                Available for ATM / Agent MoMo Cashout
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.6rem',
              marginTop: '0.8rem',
              paddingTop: '0.8rem',
              borderTop: '1px solid var(--border-subtle)',
              fontSize: '0.8rem'
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Monthly Earnings:</span>
                <strong style={{ color: 'var(--text-white)', fontFamily: 'var(--font-mono)' }}>
                  {formatPrice(315, currency)}
                </strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Completed Tours:</span>
                <strong style={{ color: 'var(--text-white)', fontFamily: 'var(--font-mono)' }}>14 verified</strong>
              </div>
            </div>
          </div>

          {/* Instant SMS Receipt Confirmation */}
          {successReceipt && (
            <div className="glass-card animate-fade-in" style={{
              border: '1px solid var(--green-border)',
              background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.12) 0%, rgba(18, 22, 34, 0.95) 100%)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--green)', marginBottom: '0.6rem' }}>
                <CheckCircle2 size={20} />
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                  MTN Mobile Money Instant Cash-In Verified
                </h4>
              </div>

              <div style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.8rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                color: 'var(--text-primary)',
                lineHeight: 1.6,
                marginBottom: '0.8rem'
              }}>
                <span style={{ color: 'var(--gold)', display: 'block', fontWeight: 700, marginBottom: '0.2rem' }}>
                  SIMULATED TELCO SMS:
                </span>
                "Y'ello! Payment of <strong>GHS {successReceipt.payoutGhs}</strong> from KWAN ESCROW received for {successReceipt.travelerName}. Available Balance updated. Ref: {successReceipt.txRef}."
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <div><strong>Host MoMo:</strong> {successReceipt.momoNumber}</div>
                <div><strong>Ghana Card:</strong> {successReceipt.ghanaCard}</div>
                <div><strong>1% Levy Remitted:</strong> GHS {successReceipt.levyRemittedGhs}</div>
                <div><strong>Disbursed At:</strong> {successReceipt.timestamp}</div>
              </div>
            </div>
          )}

          {/* Active Escrow Pending PIN List */}
          <div className="glass-card" style={{ padding: '1rem', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.6rem' }}>
              <History size={12} /> Awaiting 4-Digit Release PIN ({escrowBookings.filter(b => b.status === 'ESCROW_LOCKED').length})
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {escrowBookings.filter(b => b.status === 'ESCROW_LOCKED').map((b, idx) => (
                <div 
                  key={idx}
                  onClick={() => setEnteredPin(b.pin)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.5rem 0.7rem',
                    background: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                  title="Click to test loading this PIN into the terminal"
                >
                  <div>
                    <strong style={{ color: 'var(--text-white)' }}>{b.travelerName}</strong>
                    <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                      {b.title}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: 'var(--green)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      +{formatPrice(b.hostPayoutUsd, currency)}
                    </span>
                    <span style={{ display: 'block', color: 'var(--gold)', fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>
                      PIN: {b.pin} (Tap)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
