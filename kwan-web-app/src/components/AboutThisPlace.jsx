/**
 * AboutThisPlace — Living Corridor Layer B
 *
 * Collapsible "About this place" card that appears under the guide match.
 * Shows 3 curated facts from the matched anchor site, with a "Read more" toggle.
 */
import { useState } from 'react';
import { ChevronDown, ChevronUp, Globe } from 'lucide-react';
import { LIVING_CORRIDOR_FACTS, PILOT_CORRIDORS } from '../data/culturalKnowledge';

export default function AboutThisPlace({ corridorId }) {
  const [expanded, setExpanded] = useState(false);

  const corridor = PILOT_CORRIDORS.find(c => c.id === corridorId);
  const siteFacts = LIVING_CORRIDOR_FACTS.filter(f => f.site === corridorId || f.site === 'general');
  const previewFacts = siteFacts.slice(0, 2);
  const moreFacts = siteFacts.slice(2, 5);

  if (!corridor || siteFacts.length === 0) return null;

  const CORRIDOR_COLOURS = {
    ga_mashie:   '#F5A623',
    high_street: '#38BDF8',
    aburi_ridge: '#10B981',
    cape_coast:  '#E06D3B',
  };
  const accent = CORRIDOR_COLOURS[corridorId] || '#F5A623';

  return (
    <div style={{
      margin: '0.9rem 0',
      border: `1px solid ${accent}33`,
      borderRadius: '10px',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '0.65rem 0.9rem',
        background: `${accent}12`,
        borderBottom: expanded ? `1px solid ${accent}33` : 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        <Globe size={14} color={accent} />
        <div style={{ flex: 1 }}>
          <span style={{
            fontSize: '0.62rem',
            fontFamily: 'monospace',
            textTransform: 'uppercase',
            color: accent,
            fontWeight: 700,
            letterSpacing: '0.06em',
            display: 'block',
          }}>
            About this place
          </span>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1F2937' }}>
            {corridor.name}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(e => !e)}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: accent,
            display: 'flex',
            alignItems: 'center',
            gap: '0.2rem',
            fontSize: '0.72rem',
            fontWeight: 600,
            padding: '0.2rem 0.4rem',
          }}
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse place facts' : 'Expand place facts'}
        >
          {expanded ? 'Less' : 'Read'} {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      {/* Preview — always shown */}
      <div style={{ padding: '0.75rem 0.9rem' }}>
        <p style={{ margin: '0 0 0.5rem', fontSize: '0.78rem', color: '#4B5563', lineHeight: 1.5 }}>
          {corridor.description}
        </p>

        {previewFacts.map((fact, i) => (
          <FactItem key={i} fact={fact} accent={accent} />
        ))}

        {/* Expanded section */}
        {expanded && moreFacts.map((fact, i) => (
          <FactItem key={`more-${i}`} fact={fact} accent={accent} />
        ))}

        {/* Highlights */}
        {expanded && corridor.highlights?.length > 0 && (
          <div style={{ marginTop: '0.7rem' }}>
            <span style={{
              fontSize: '0.62rem',
              fontFamily: 'monospace',
              textTransform: 'uppercase',
              color: '#94A3B8',
              display: 'block',
              marginBottom: '0.3rem',
            }}>
              Key stops in this corridor
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
              {corridor.highlights.map((h, i) => (
                <span key={i} style={{
                  fontSize: '0.7rem',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '999px',
                  background: `${accent}14`,
                  color: accent,
                  border: `1px solid ${accent}30`,
                  fontWeight: 600,
                }}>
                  {h}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FactItem({ fact, accent }) {
  return (
    <div style={{
      display: 'flex',
      gap: '0.5rem',
      margin: '0.5rem 0',
      paddingLeft: '0.6rem',
      borderLeft: `2px solid ${accent}55`,
    }}>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: '0.77rem', color: '#374151', lineHeight: 1.5, fontStyle: 'italic' }}>
          "{fact.text}"
        </p>
        {fact.source && (
          <span style={{ fontSize: '0.62rem', color: '#94A3B8', fontFamily: 'monospace', display: 'block', marginTop: '0.15rem' }}>
            — {fact.source}
          </span>
        )}
      </div>
    </div>
  );
}
