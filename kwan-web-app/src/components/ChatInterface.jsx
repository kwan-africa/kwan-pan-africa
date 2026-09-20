import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, ShieldCheck, Volume2, Tag } from 'lucide-react';
import { executeRAGQuery } from '../services/ragEngine';
import { playPronunciation, CULTURAL_LEXICON, THEMES } from '../data/culturalKnowledge';
import ItineraryCard from './ItineraryCard';

const PRESET_PROMPTS = [
  { label: "✨ Spiritual Roots Pilgrimage", query: "A spiritual journey to reconnect with my roots: Cape Coast Castle, ancestral remembrance, and Ga-Mashie cultural immersion." },
  { label: "🥊 Ga-Mashie Roots & Boxing", query: "Plan a 2-day roots tour in Ga-Mashie with boxing training, bead making, and local kenkey." },
  { label: "🏛️ Kwame Nkrumah Park & High Street", query: "I want to explore Kwame Nkrumah Memorial Park, Independence Arch, and carve Adinkra stamps at the Arts Centre." },
  { label: "🌿 Aburi Botanical Gardens & Cocoa Trek", query: "Weekend nature trek to Aburi Gardens with herbal medicine walk and Tetteh Quarshie cocoa farm." }
];

export default function ChatInterface({ onBookItinerary, currency }) {
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: "Akwaaba! I am Kwan, your Grassroots Cultural Travel Concierge.\n\nTell me the trip you envision. Whether it's morning boxing in Bukom, carving Adinkra symbols at the Arts Centre, or walking among 130-year-old healing trees in Aburi—I match you directly to verified local masters and handle multi-vendor bookings in one conversation.",
      itinerary: null,
      ragInfo: null
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (queryText) => {
    const promptToSend = queryText || input;
    if (!promptToSend.trim()) return;

    // Add user message
    setMessages(prev => [...prev, {
      sender: 'user',
      text: promptToSend,
      itinerary: null,
      ragInfo: null
    }]);

    if (!queryText) setInput('');
    setIsTyping(true);

    try {
      // Execute RAG Query
      const result = await executeRAGQuery(promptToSend);

      // Simulate human-like responsive typing
      setTimeout(() => {
        setMessages(prev => [...prev, {
          sender: 'assistant',
          text: result.message,
          itinerary: result.itinerary,
          ragInfo: result.retrievedDocs
        }]);
        setIsTyping(false);
      }, 700);

    } catch {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        sender: 'assistant',
        text: "I encountered an error connecting to the knowledge base. Please try again with one of our pilot corridors: Ga-Mashie, High Street, or Aburi.",
        itinerary: null,
        ragInfo: null
      }]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)', minHeight: '600px' }}>
      
      {/* Hero Banner & Dialect Audio Studio */}
      <div style={{ marginBottom: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.6rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--text-white)' }}>
              Autonomous Trip Concierge <span style={{ color: 'var(--gold)' }}>· RAG Engine</span>
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Natural conversation matches verified grassroots hosts & builds instant multi-vendor itineraries.
            </p>
          </div>
          <div className="badge badge-green">
            <ShieldCheck size={14} /> 100% Ghana Card Verified Hosts
          </div>
        </div>

        {/* Dialect Audio Studio Pills */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '0.4rem 0.8rem',
          marginBottom: '0.6rem'
        }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--gold)', fontFamily: 'var(--font-mono)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Volume2 size={13} /> DIALECT AUDIO:
          </span>
          {CULTURAL_LEXICON.slice(0, 4).map((lex, i) => (
            <button
              key={i}
              className="audio-phrase-pill"
              onClick={() => playPronunciation(lex.term)}
              title={`${lex.term} (${lex.language}): ${lex.meaning}. Tap to hear pronunciation.`}
            >
              <strong>{lex.term}</strong>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({lex.meaning})</span>
            </button>
          ))}
        </div>

        {/* Theme Classification Category Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap', marginBottom: '0.45rem' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
            Curated Themes:
          </span>
          {THEMES.map(theme => (
            <button
              key={theme.id}
              onClick={() => handleSend(`Plan a journey focused on ${theme.label}, visiting ${theme.anchorSite}.`)}
              disabled={isTyping}
              className="badge badge-navy"
              style={{
                cursor: 'pointer',
                border: '1px solid var(--border-medium)',
                background: 'rgba(255, 255, 255, 0.04)',
                padding: '0.22rem 0.55rem',
                fontSize: '0.74rem',
                transition: 'all 0.15s',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
              title={`Classified Tag: ${theme.tag}`}
            >
              <Tag size={11} color="var(--cyan)" />
              <span>{theme.label}</span>
            </button>
          ))}
        </div>

        {/* Preset Chips */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {PRESET_PROMPTS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(preset.query)}
              disabled={isTyping}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-full)',
                padding: '0.4rem 0.85rem',
                color: 'var(--text-secondary)',
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--gold)';
                e.currentTarget.style.color = 'var(--text-white)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              <span>{preset.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.2rem'
      }}>
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className="animate-fade-in"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: msg.sender === 'user' ? '80%' : '100%',
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            {/* Sender Label */}
            <div style={{
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              marginBottom: '0.3rem',
              fontFamily: 'var(--font-mono)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              {msg.sender === 'user' ? 'YOU (TRAVELER)' : 'KWAN CULTURAL AI'}
              {msg.ragInfo && (
                <span className="badge badge-cyan" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                  RAG MATCHED {msg.ragInfo.hosts.length} HOSTS
                </span>
              )}
            </div>

            {/* Bubble */}
            <div style={{
              background: msg.sender === 'user' ? 'var(--gold)' : 'var(--bg-card)',
              color: msg.sender === 'user' ? '#0F172A' : 'var(--text-primary)',
              borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              padding: '1rem 1.25rem',
              border: msg.sender === 'user' ? 'none' : '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-card)',
              fontSize: '0.95rem',
              whiteSpace: 'pre-line',
              fontWeight: msg.sender === 'user' ? 600 : 400,
              width: '100%'
            }}>
              {msg.text}
            </div>

            {/* Embedded Itinerary Card */}
            {msg.itinerary && (
              <div style={{ width: '100%' }}>
                <ItineraryCard 
                  itinerary={msg.itinerary} 
                  onBook={onBookItinerary}
                  currency={currency}
                />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--gold)', padding: '0.5rem 0' }}>
            <Sparkles size={16} className="pulse-gold" />
            <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
              Retrieving cultural knowledge & verifying host availability...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        style={{
          display: 'flex',
          gap: '0.6rem',
          marginTop: '0.8rem',
          position: 'relative'
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your ideal cultural journey (e.g. 2-day roots pilgrimage with boxing and Adinkra carving)..."
          disabled={isTyping}
          style={{
            flex: 1,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            padding: '0.9rem 1.2rem',
            color: 'var(--text-white)',
            fontSize: '0.95rem',
            fontFamily: 'var(--font-sans)',
            outline: 'none',
            boxShadow: 'var(--shadow-card)'
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--gold)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border-medium)'}
        />
        <button
          type="submit"
          disabled={isTyping || !input.trim()}
          className="btn btn-gold"
          style={{
            padding: '0 1.5rem',
            opacity: (!input.trim() || isTyping) ? 0.5 : 1,
            cursor: (!input.trim() || isTyping) ? 'not-allowed' : 'pointer'
          }}
        >
          <Send size={18} />
          <span>Send</span>
        </button>
      </form>

    </div>
  );
}
