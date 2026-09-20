import React from 'react';
import { Database } from 'lucide-react';
import { formatPrice } from '../data/culturalKnowledge';

export default function LedgerView({ escrowBookings, currency = 'USD' }) {
  const totalGmv = escrowBookings.reduce((sum, b) => sum + b.totalAmountUsd, 0);
  const totalDisbursed = escrowBookings
    .filter(b => b.status === 'SETTLED')
    .reduce((sum, b) => sum + b.hostPayoutUsd, 0);
  const totalLevy = escrowBookings.reduce((sum, b) => sum + b.levyUsd, 0);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1080px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div className="badge badge-cyan" style={{ marginBottom: '0.4rem' }}>
            <Database size={14} /> IMMUTABLE AUDIT TRAIL
          </div>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--text-white)' }}>
            Live Escrow & Settlement Ledger
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Dual-sided ledger tracking Paystack card escrow deposits, 90% MoMo disbursements, and statutory 1% Ghana Tourism Levy remittances.
          </p>
        </div>

        <div className="badge badge-gold">
          BANK OF GHANA SANDBOX ALIGNED
        </div>
      </div>

      {/* KPI Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
        marginBottom: '1.8rem'
      }}>
        <div className="glass-card">
          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            Total GMV Captured
          </span>
          <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-white)', fontFamily: 'var(--font-mono)' }}>
            {formatPrice(totalGmv, currency)}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Gross card checkout volume</span>
        </div>

        <div className="glass-card">
          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            Settled to Host MoMo (90%)
          </span>
          <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>
            {formatPrice(totalDisbursed, currency)}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--green)' }}>Direct to MTN MoMo wallets</span>
        </div>

        <div className="glass-card">
          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            GTA 1% Levy Remitted
          </span>
          <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--cyan)', fontFamily: 'var(--font-mono)' }}>
            {formatPrice(totalLevy, currency)}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Tourism Act 817 compliance</span>
        </div>

        <div className="glass-card">
          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            Active Escrow Vault
          </span>
          <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--gold)', fontFamily: 'var(--font-mono)' }}>
            {escrowBookings.filter(b => b.status === 'ESCROW_LOCKED').length}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Awaiting 4-Digit PIN release</span>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.2rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ fontSize: '1rem', color: 'var(--text-white)' }}>Transactions Ledger</h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {escrowBookings.length} Recorded Entries
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '0.8rem 1rem', fontFamily: 'var(--font-mono)' }}>BOOKING ID</th>
                <th style={{ padding: '0.8rem 1rem' }}>TRAVELER</th>
                <th style={{ padding: '0.8rem 1rem' }}>ITINERARY</th>
                <th style={{ padding: '0.8rem 1rem', fontFamily: 'var(--font-mono)' }}>CARD CHARGED</th>
                <th style={{ padding: '0.8rem 1rem', fontFamily: 'var(--font-mono)' }}>HOST MOMO (90%)</th>
                <th style={{ padding: '0.8rem 1rem', fontFamily: 'var(--font-mono)' }}>1% LEVY</th>
                <th style={{ padding: '0.8rem 1rem' }}>ESCROW STATUS</th>
              </tr>
            </thead>
            <tbody>
              {escrowBookings.map((b, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.9rem 1rem', fontFamily: 'var(--font-mono)', color: 'var(--text-white)', fontWeight: 600 }}>
                    {b.id}
                  </td>
                  <td style={{ padding: '0.9rem 1rem', color: 'var(--text-primary)' }}>
                    {b.travelerName}
                  </td>
                  <td style={{ padding: '0.9rem 1rem', color: 'var(--text-secondary)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {b.title}
                  </td>
                  <td style={{ padding: '0.9rem 1rem', fontFamily: 'var(--font-mono)', color: 'var(--text-white)', fontWeight: 700 }}>
                    {formatPrice(b.totalAmountUsd, currency)}
                  </td>
                  <td style={{ padding: '0.9rem 1rem', fontFamily: 'var(--font-mono)', color: 'var(--green)', fontWeight: 700 }}>
                    +{formatPrice(b.hostPayoutUsd, currency)}
                  </td>
                  <td style={{ padding: '0.9rem 1rem', fontFamily: 'var(--font-mono)', color: 'var(--cyan)' }}>
                    {formatPrice(b.levyUsd, currency)}
                  </td>
                  <td style={{ padding: '0.9rem 1rem' }}>
                    {b.status === 'ESCROW_LOCKED' ? (
                      <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
                        LOCKED (PIN: {b.pin})
                      </span>
                    ) : (
                      <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>
                        DISBURSED ✓
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
