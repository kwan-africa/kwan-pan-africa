/**
 * RotatingFacts — Living Corridor Layer A
 *
 * Cycles through curated cultural facts above the chat input.
 * Facts rotate automatically every 6 seconds with a smooth fade.
 * A progress bar shows time remaining before the next fact.
 */
import { useEffect, useRef, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { LIVING_CORRIDOR_FACTS } from '../data/culturalKnowledge';

// Only surface general + high-traffic site facts for the landing ticker
const TICKER_FACTS = LIVING_CORRIDOR_FACTS.filter(f =>
  ['general', 'cape_coast', 'ga_mashie', 'high_street'].includes(f.site)
);

const INTERVAL_MS = 6000;

export default function RotatingFacts({ activeSite = null }) {
  // If a guide is matched, prioritise facts from their site
  const pool = activeSite
    ? [
        ...LIVING_CORRIDOR_FACTS.filter(f => f.site === activeSite),
        ...LIVING_CORRIDOR_FACTS.filter(f => f.site === 'general'),
      ]
    : TICKER_FACTS;

  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const progressRef = useRef(null);

  const fact = pool[index % pool.length];

  // Rotate on interval with a quick fade-out / fade-in
  useEffect(() => {
    // Progress bar ticks every 50 ms
    progressRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + (50 / INTERVAL_MS) * 100;
      });
    }, 50);

    timerRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex(prev => (prev + 1) % pool.length);
        setVisible(true);
        setProgress(0);
      }, 350);
    }, INTERVAL_MS - 350);

    return () => {
      clearTimeout(timerRef.current);
      clearInterval(progressRef.current);
    };
  }, [index, pool.length]);

  const CATEGORY_COLOURS = {
    history:     '#F5A623',
    culture:     '#38BDF8',
    sport:       '#10B981',
    arts:        '#C084FC',
    diaspora:    '#FB7185',
    music:       '#F97316',
    nature:      '#4ADE80',
    economy:     '#94A3B8',
    legacy:      '#E06D3B',
    remembrance: '#F87171',
    tradition:   '#FBBF24',
    medicine:    '#6EE7B7',
    symbolism:   '#A78BFA',
    art:         '#C084FC',
    language:    '#38BDF8',
    spirituality:'#F5A623',
    etymology:   '#94A3B8',
  };

  const accent = CATEGORY_COLOURS[fact?.category] || '#F5A623';

  return (
    <div
      style={{
        margin: '0 0 0.75rem',
        padding: '0.65rem 0.8rem',
        borderRadius: '10px',
        background: 'linear-gradient(135deg, rgba(33,71,52,0.06) 0%, rgba(245,166,35,0.05) 100%)',
        border: '1px solid rgba(245,166,35,0.18)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'opacity 0.35s ease',
        opacity: visible ? 1 : 0,
        minHeight: '0',
      }}
      aria-live="polite"
      aria-label="Cultural fact from the Living Corridor"
    >
      {/* Progress bar */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        height: '2px',
        width: `${progress}%`,
        background: accent,
        transition: 'width 0.05s linear',
        borderRadius: '0 2px 2px 0',
      }} />

      {/* Category badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
        <BookOpen size={13} color={accent} />
        <span style={{
          fontSize: '0.63rem',
          fontFamily: 'monospace',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: accent,
          fontWeight: 700,
        }}>
          Living Corridor · {fact?.category}
        </span>
        {/* Dot indicators */}
        <div style={{ display: 'flex', gap: '3px', marginLeft: 'auto' }}>
          {pool.slice(0, Math.min(pool.length, 7)).map((_, i) => (
            <span key={i} style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background: i === (index % pool.length) ? accent : 'rgba(0,0,0,0.15)',
              transition: 'background 0.3s',
              display: 'inline-block',
            }} />
          ))}
        </div>
      </div>

      {/* Fact text */}
      <p style={{
        margin: 0,
        fontSize: '0.8rem',
        color: '#1F2937',
        lineHeight: 1.4,
        fontStyle: 'italic',
      }}>
        "{fact?.text}"
      </p>

      {/* Source */}
      {fact?.source && (
        <span style={{
          display: 'block',
          marginTop: '0.3rem',
          fontSize: '0.65rem',
          color: '#94A3B8',
          fontFamily: 'monospace',
        }}>
          — {fact.source}
        </span>
      )}
    </div>
  );
}
