import React, { useState } from 'react';
import { Calendar, MapPin, ShieldCheck, ArrowRight, Smartphone, Trash2, Tag, Compass } from 'lucide-react';
import { formatPrice } from '../data/culturalKnowledge';

export default function ItineraryCard({ itinerary, onBook, currency = 'USD' }) {
  const [removedStopIds, setRemovedStopIds] = useState([]);

  if (!itinerary) return null;

  const { title, daysCount, corridors, theme, anchorSite, stops = [] } = itinerary;

  // Filter stops based on removed IDs (derived state)
  const currentStops = stops.filter(s => !removedStopIds.includes(s.hostId));

  // Live recalculate pricing on stop changes
  const totalCost = currentStops.reduce((sum, s) => sum + s.cost, 0);
  const hostMoMoPayoutUsd = Math.round(totalCost * 0.90 * 100) / 100;
  const kwanPlatformFeeUsd = Math.round(totalCost * 0.10 * 100) / 100;
  const tourismLevyUsd = Math.round(totalCost * 0.01 * 100) / 100;

  const handleRemoveStop = (hostId) => {
    if (currentStops.length <= 1) return;
    setRemovedStopIds(prev => [...prev, hostId]);
  };

  const handleBookCurrent = () => {
    const updatedItinerary = {
      ...itinerary,
      stops: currentStops,
      hostsCount: currentStops.length,
      pricing: {
        totalUsd: totalCost,
        hostMoMoPayoutUsd,
        kwanPlatformFeeUsd,
        tourismLevyUsd,
        payoutPercent: "90% Direct MoMo Payout"
      }
    };
    onBook(updatedItinerary);
  };

  return (
    <div className="glass-card animate-fade-in" style={{
      marginTop: '1.2rem',
      border: '1px solid rgba(245, 166, 35, 0.3)',
      background: 'linear-gradient(180deg, rgba(23, 28, 43, 0.95) 0%, rgba(18, 22, 34, 0.95) 100%)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.4rem'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
            <span className="badge badge-gold">
              <Calendar size={12} /> {daysCount} DAY{daysCount > 1 ? 'S' : ''} ITINERARY
            </span>
            {theme && (
              <span className="badge badge-navy" style={{ background: 'rgba(56, 189, 248, 0.15)', color: 'var(--cyan)' }}>
                <Tag size={12} /> {theme.tag || theme.label}
              </span>
            )}
            {corridors.map((c, i) => (
              <span key={i} className="badge badge-cyan">
                <MapPin size={12} /> {c}
              </span>
            ))}
          </div>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--text-white)' }}>{title}</h3>
          {anchorSite && (
            <p style={{ fontSize: '0.8rem', color: 'var(--gold)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Compass size={13} /> Anchor Site: <strong>{anchorSite}</strong>
            </p>
          )}
        </div>

        {/* Total Cost Badge */}
        <div style={{
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '0.5rem 0.9rem',
          textAlign: 'right'
        }}>
          <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--green)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
            ESCROW TOTAL {currentStops.length !== (itinerary.stops?.length || 0) && '(EDITED)'}
          </span>
          <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-white)', fontFamily: 'var(--font-mono)' }}>
            {formatPrice(totalCost, currency)}
          </span>
        </div>
      </div>

      {/* Timeline Stops with Edit Action */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', margin: '1.2rem 0' }}>
        {currentStops.map((stop, idx) => (
          <div key={idx} style={{
            display: 'flex',
            gap: '1rem',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.9rem 1rem',
            alignItems: 'center'
          }}>
            {/* Host Avatar / Image */}
            <div style={{ position: 'relative', width: '52px', height: '52px', flexShrink: 0 }}>
              <img 
                src={stop.hostImage || '/kwan_logo_square_white_bg.png'} 
                alt={stop.hostName}
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: 'var(--radius-md)',
                  objectFit: 'cover',
                  border: '1px solid var(--border-medium)'
                }}
                onError={(e) => { e.target.src = '/kwan_logo_square_white_bg.png'; }}
              />
              <div style={{
                position: 'absolute',
                bottom: '-4px',
                right: '-4px',
                background: 'var(--green)',
                color: '#0F172A',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShieldCheck size={12} />
              </div>
            </div>

            {/* Stop Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                <span className="badge badge-navy" style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem' }}>
                  DAY {stop.day} · {stop.time}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  ID: {stop.ghanaCard}
                </span>
              </div>
              <h4 style={{ fontSize: '1rem', color: 'var(--text-white)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {stop.hostName}
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {stop.hostRole} · <span style={{ color: 'var(--gold)' }}>{stop.corridor}</span>
              </p>
            </div>

            {/* Price, Payout & Live Edit Action */}
            <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem' }}>
              <span style={{ display: 'block', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-white)', fontFamily: 'var(--font-mono)' }}>
                {formatPrice(stop.cost, currency)}
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <Smartphone size={10} /> 90% MoMo Payout
              </span>

              {/* Edit / Remove Stop Button */}
              {currentStops.length > 1 && (
                <button
                  onClick={() => handleRemoveStop(stop.hostId)}
                  title="Remove this stop from itinerary"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#F87171',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.2rem 0.5rem',
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    marginTop: '0.25rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Trash2 size={11} /> Remove Stop
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Transparent Economics Waterfall Card (Live Recalculated) */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.35)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '0.85rem 1rem',
        margin: '1.2rem 0',
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div>
          <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            Direct Host MoMo (90%)
          </span>
          <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>
            +{formatPrice(hostMoMoPayoutUsd, currency)}
          </span>
        </div>
        <div>
          <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            Kwan Take Rate (10%)
          </span>
          <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--gold)', fontFamily: 'var(--font-mono)' }}>
            {formatPrice(kwanPlatformFeeUsd, currency)}
          </span>
        </div>
        <div>
          <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            GTA 1% Tourism Levy
          </span>
          <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--cyan)', fontFamily: 'var(--font-mono)' }}>
            {formatPrice(tourismLevyUsd, currency)}
          </span>
        </div>
        <div>
          <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            Trust Mechanism
          </span>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-white)' }}>
            4-Digit Escrow PIN
          </span>
        </div>
      </div>

      {/* Action Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          onClick={handleBookCurrent}
          className="btn btn-gold"
          style={{ width: '100%', maxWidth: '320px', fontSize: '1rem' }}
        >
          <span>Book with Escrow PIN</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
