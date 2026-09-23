/**
 * SankofaPlanner — Week planning mode
 *
 * Renders a 5-day week strip where each day can be assigned a theme.
 * The user can load a pre-built template or build from scratch.
 * On "Confirm plan" it returns an array of booked days to the parent.
 */
import { useState } from 'react';
import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronUp,
  Compass,
  Sparkles,
  X,
} from 'lucide-react';
import { VERIFIED_HOSTS, SANKOFA_WEEK_TEMPLATES } from '../data/culturalKnowledge';
import { matchGuideOffline } from '../services/offlineFallback';

const THEME_LABELS = {
  heritage_spiritual: { label: 'Heritage / Spiritual',  color: '#E06D3B', tag: 'HS' },
  adventure:          { label: 'Adventure / Boxing',    color: '#10B981', tag: 'ADV' },
  art:                { label: 'Art / Crafts',           color: '#7C3AED', tag: 'ART' },
  food:               { label: 'Culinary',               color: '#D97706', tag: 'CUL' },
};

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const DEFAULT_DAYS = DAY_LABELS.slice(0, 3).map((label, i) => ({
  dayIndex: i,
  label,
  theme: null,
  hostId: null,
  notes: '',
}));

function resolveHost(hostId) {
  if (!hostId) return null;
  return VERIFIED_HOSTS.find(h => h.id === hostId) || null;
}

function dayTotal(day) {
  if (!day.theme || !day.hostId) return 0;
  const host = resolveHost(day.hostId);
  return host?.hourlyRateUsd || 50;
}

function daysFromTemplate(template) {
  if (!template) return DEFAULT_DAYS;
  return DAY_LABELS.map((label, i) => {
    const day = template.days.find(item => item.dayIndex === i);
    return day
      ? { ...day, label }
      : { dayIndex: i, label, theme: null, hostId: null, notes: '' };
  });
}

export default function SankofaPlanner({ onConfirmPlan, onClose, initialTemplate = null, initialStartDate = '' }) {
  const [days, setDays] = useState(() => daysFromTemplate(initialTemplate));
  const [activeDay, setActiveDay] = useState(null);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [confirming, setConfirming] = useState(false);

  const total = days.reduce((sum, d) => sum + dayTotal(d), 0);
  const bookedCount = days.filter(d => d.theme && d.hostId).length;

  function loadTemplate(template) {
    setDays(
      DAY_LABELS.map((label, i) => {
        const t = template.days.find(d => d.dayIndex === i);
        return t
          ? { ...t, label }
          : { dayIndex: i, label, theme: null, hostId: null, notes: '' };
      })
    );
    setTemplateOpen(false);
  }

  function addDay() {
    if (days.length >= DAY_LABELS.length) return;
    const dayIndex = days.length;
    setDays(prev => [...prev, { dayIndex, label: DAY_LABELS[dayIndex], theme: null, hostId: null, notes: '' }]);
  }

  function removeDay() {
    if (days.length <= 3) return;
    const removed = days[days.length - 1];
    if (removed.theme && !window.confirm('Remove the last planned day?')) return;
    setDays(prev => prev.slice(0, -1));
  }

  function setDayTheme(dayIndex, theme) {
    if (!theme) {
      setDays(prev => prev.map(d => d.dayIndex === dayIndex ? { ...d, theme: null, hostId: null, notes: '' } : d));
      return;
    }
    // Auto-match a guide offline
    const themeMap = {
      heritage_spiritual: 'spiritual journey roots heritage',
      adventure:          'boxing adventure bukom sport',
      art:                'bead carving adinkra craft art',
      food:               'food waakye culinary shito chop',
    };
    try {
      const guide = matchGuideOffline(themeMap[theme] || theme);
      setDays(prev => prev.map(d =>
        d.dayIndex === dayIndex
          ? { ...d, theme, hostId: guide.id, notes: guide.anchorSite || '' }
          : d
      ));
    } catch {
      setDays(prev => prev.map(d => d.dayIndex === dayIndex ? { ...d, theme, hostId: null, notes: '' } : d));
    }
  }

  function clearDay(dayIndex) {
    setDays(prev => prev.map(d =>
      d.dayIndex === dayIndex ? { ...d, theme: null, hostId: null, notes: '' } : d
    ));
    if (activeDay === dayIndex) setActiveDay(null);
  }

  function handleConfirm() {
    if (bookedCount === 0 || !startDate) return;
    setConfirming(true);
    // Enrich days with full host objects
    const enriched = days
      .filter(d => d.theme && d.hostId)
      .map(d => ({
        ...d,
        host: resolveHost(d.hostId),
        price: dayTotal(d),
      }));
    onConfirmPlan({ days: enriched, startDate, total });
    setConfirming(false);
  }

  return (
    <div style={{
      background: '#FAFAF8',
      borderRadius: '16px',
      border: '1px solid rgba(33,71,52,0.15)',
      overflow: 'hidden',
      boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    }}>
      {/* Header */}
      <div style={{
        padding: '1rem 1.2rem',
        background: 'linear-gradient(135deg, #214734 0%, #2d5c45 100%)',
        color: '#fff',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '0.8rem',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <Compass size={16} />
            <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.75 }}>
              Sankofa Plan · Week builder
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, lineHeight: 1.2 }}>
            Craft your week in Ghana.
          </h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.78rem', opacity: 0.75, lineHeight: 1.4 }}>
            Assign a theme to each day. Kwan auto-matches a verified guide for each one.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', padding: '0.35rem' }}
          aria-label="Close Sankofa Planner"
        >
          <X size={18} />
        </button>
      </div>

      <div style={{ padding: '1rem 1.2rem' }}>

        {/* Template picker */}
        <div style={{ marginBottom: '1rem' }}>
          <button
            type="button"
            onClick={() => setTemplateOpen(o => !o)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(245,166,35,0.1)',
              border: '1px solid rgba(245,166,35,0.3)',
              borderRadius: '8px',
              padding: '0.45rem 0.8rem',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: '#8e5c19',
              cursor: 'pointer',
              width: '100%',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={14} /> Load a curated week template
            </span>
            {templateOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {templateOpen && (
            <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {SANKOFA_WEEK_TEMPLATES.map(tmpl => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => loadTemplate(tmpl)}
                  style={{
                    textAlign: 'left',
                    padding: '0.6rem 0.8rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(33,71,52,0.15)',
                    background: '#fff',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(33,71,52,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  <strong style={{ fontSize: '0.82rem', color: '#214734', display: 'block' }}>{tmpl.name}</strong>
                  <span style={{ fontSize: '0.72rem', color: '#647067' }}>{tmpl.description}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Day strip */}
        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
          <button type="button" className="text-button" onClick={removeDay} disabled={days.length <= 3}>− Remove day</button>
          <button type="button" className="text-button" onClick={addDay} disabled={days.length >= 7}>+ Add day</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '1rem' }}>
          {days.map(day => {
            const theme = THEME_LABELS[day.theme];
            const host  = resolveHost(day.hostId);
            const isOpen = activeDay === day.dayIndex;

            return (
              <div
                key={day.dayIndex}
                style={{
                  borderRadius: '10px',
                  border: `1px solid ${theme ? `${theme.color}44` : 'rgba(0,0,0,0.1)'}`,
                  background: theme ? `${theme.color}08` : '#fff',
                  overflow: 'hidden',
                  transition: 'all 0.15s',
                }}
              >
                {/* Day row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.6rem 0.8rem',
                    cursor: 'pointer',
                  }}
                  onClick={() => setActiveDay(isOpen ? null : day.dayIndex)}
                >
                  {/* Day label */}
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    background: theme ? theme.color : 'rgba(0,0,0,0.07)',
                    color: theme ? '#fff' : '#94A3B8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    fontFamily: 'monospace',
                  }}>
                    {theme ? theme.tag : day.label[0]}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1F2937' }}>
                      {day.label}
                      {theme && <span style={{ fontWeight: 400, color: theme.color, marginLeft: '0.4rem' }}>· {theme.label}</span>}
                    </div>
                    {host && (
                      <div style={{ fontSize: '0.72rem', color: '#647067', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {host.name} · {day.notes}
                      </div>
                    )}
                    {!theme && (
                      <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Tap to assign a theme</div>
                    )}
                  </div>

                  {day.theme && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: theme?.color }}>
                      ${dayTotal(day)}
                    </span>
                  )}

                  {day.theme
                    ? <button type="button" onClick={e => { e.stopPropagation(); clearDay(day.dayIndex); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '2px', display: 'flex' }}><X size={14} /></button>
                    : (isOpen ? <ChevronUp size={14} color="#94A3B8" /> : <ChevronDown size={14} color="#94A3B8" />)
                  }
                </div>

                {/* Theme picker (only when day is open and no theme set) */}
                {isOpen && !day.theme && (
                  <div style={{
                    padding: '0 0.8rem 0.7rem',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.35rem',
                  }}>
                    {Object.entries(THEME_LABELS).map(([key, t]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => { setDayTheme(day.dayIndex, key); setActiveDay(null); }}
                        style={{
                          padding: '0.5rem 0.6rem',
                          borderRadius: '8px',
                          border: `1px solid ${t.color}40`,
                          background: `${t.color}0f`,
                          color: t.color,
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          transition: 'background 0.12s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = `${t.color}20`}
                        onMouseLeave={e => e.currentTarget.style.background = `${t.color}0f`}
                      >
                        {t.emoji} {t.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => { clearDay(day.dayIndex); setActiveDay(null); }}
                      style={{ padding: '0.5rem 0.6rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', background: 'transparent', color: '#94A3B8', fontSize: '0.75rem', cursor: 'pointer', textAlign: 'left', gridColumn: '1 / -1' }}
                    >
                      Rest day (skip this day)
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Start date */}
        <div style={{ marginBottom: '0.8rem' }}>
          <label
            htmlFor="sankofa-start-date"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}
          >
            <CalendarDays size={14} /> Week starting
          </label>
          <input
            id="sankofa-start-date"
            type="date"
            value={startDate}
            min={new Date().toISOString().slice(0, 10)}
            onChange={e => setStartDate(e.target.value)}
            style={{ width: '100%', padding: '0.5rem 0.7rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.15)', fontSize: '0.82rem', boxSizing: 'border-box' }}
          />
        </div>

        {/* Summary + CTA */}
        <div style={{
          padding: '0.75rem 0.9rem',
          background: 'rgba(33,71,52,0.05)',
          borderRadius: '8px',
          border: '1px solid rgba(33,71,52,0.1)',
          marginBottom: '0.8rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#647067', display: 'block' }}>
              {bookedCount} experience{bookedCount !== 1 ? 's' : ''} · {5 - bookedCount} day{5 - bookedCount !== 1 ? 's' : ''} unassigned
            </span>
            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#214734' }}>
              ${total.toFixed(2)} total
            </span>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#94A3B8', textAlign: 'right', maxWidth: '130px' }}>
            One combined payment link for the selected experiences
          </span>
        </div>

        <button
          type="button"
          className="button button-primary button-full"
          onClick={handleConfirm}
          disabled={bookedCount === 0 || !startDate || confirming}
          style={{ opacity: bookedCount === 0 || !startDate ? 0.5 : 1 }}
        >
          <Check size={16} />
          {confirming ? 'Building your plan...' : `Confirm Sankofa Plan · ${bookedCount} experience${bookedCount !== 1 ? 's' : ''}`}
        </button>
        {(bookedCount === 0 || !startDate) && (
          <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#94A3B8', marginTop: '0.4rem' }}>
            {bookedCount === 0 ? 'Add at least one experience day to continue.' : 'Select a start date to continue.'}
          </p>
        )}
      </div>
    </div>
  );
}
