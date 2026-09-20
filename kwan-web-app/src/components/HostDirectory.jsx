import React, { useState } from 'react';
import { ShieldCheck, MapPin, Star, MessageSquare, Smartphone, Languages } from 'lucide-react';
import { VERIFIED_HOSTS, PILOT_CORRIDORS, formatPrice } from '../data/culturalKnowledge';

export default function HostDirectory({ onSelectHostForChat, currency = 'USD' }) {
  const [selectedCorridor, setSelectedCorridor] = useState('all');

  const filteredHosts = selectedCorridor === 'all'
    ? VERIFIED_HOSTS
    : VERIFIED_HOSTS.filter(h => h.corridorId === selectedCorridor);

  return (
    <div className="animate-fade-in">
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div className="badge badge-gold" style={{ marginBottom: '0.4rem' }}>
            <ShieldCheck size={14} /> 100% IN-PERSON AUDITED
          </div>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--text-white)' }}>
            Verified Grassroots Host Registry
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Master boxing trainers, traditional bead elders, and Pan-African historians with biometric Ghana Card verification.
          </p>
        </div>

        {/* Corridor Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', background: 'var(--bg-card)', padding: '0.3rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
          <button
            onClick={() => setSelectedCorridor('all')}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: selectedCorridor === 'all' ? 'var(--gold)' : 'transparent',
              color: selectedCorridor === 'all' ? '#0F172A' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            All Corridors ({VERIFIED_HOSTS.length})
          </button>
          {PILOT_CORRIDORS.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCorridor(c.id)}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: selectedCorridor === c.id ? 'var(--gold)' : 'transparent',
                color: selectedCorridor === c.id ? '#0F172A' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '1.4rem'
      }}>
        {filteredHosts.map(host => (
          <div 
            key={host.id} 
            className="glass-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '1.3rem'
            }}
          >
            <div>
              {/* Host Top Line */}
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.9rem' }}>
                <img 
                  src={host.image || '/kwan_logo_square_white_bg.png'} 
                  alt={host.name}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: 'var(--radius-md)',
                    objectFit: 'cover',
                    border: '1px solid var(--border-medium)'
                  }}
                  onError={(e) => { e.target.src = '/kwan_logo_square_white_bg.png'; }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span className="badge badge-green" style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem' }}>
                      <ShieldCheck size={11} /> GHANA CARD VERIFIED
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 700 }}>
                      <Star size={12} fill="var(--gold)" color="var(--gold)" />
                      {host.rating}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.05rem', color: 'var(--text-white)' }}>{host.name}</h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--gold)', fontWeight: 600 }}>
                    {host.role}
                  </span>
                </div>
              </div>

              {/* Corridor & Rate */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '0.7rem',
                marginBottom: '0.8rem'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <MapPin size={12} style={{ color: 'var(--cyan)' }} />
                  {host.corridorName}
                </span>
                <span style={{ fontWeight: 700, color: 'var(--text-white)', fontFamily: 'var(--font-mono)' }}>
                  {formatPrice(host.hourlyRateUsd, currency)} / tour
                </span>
              </div>

              {/* Bio */}
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '0.9rem' }}>
                {host.bio}
              </p>

              {/* Metadata Pills */}
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontFamily: 'var(--font-mono)' }}>
                  <Smartphone size={12} /> {host.momoNetwork} ({host.momoNumber})
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Languages size={12} /> {host.languages.join(', ')}
                </span>
              </div>
            </div>

            {/* Action */}
            <button
              onClick={() => onSelectHostForChat(host)}
              className="btn btn-outline"
              style={{ width: '100%', fontSize: '0.88rem' }}
            >
              <MessageSquare size={16} />
              <span>Plan Journey with {host.name.split(' ')[0]}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
