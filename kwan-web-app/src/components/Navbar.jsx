import React from 'react';
import { MessageSquare, Users, Smartphone, Database, Sun, Moon } from 'lucide-react';

export default function Navbar({ 
  currentView, 
  setCurrentView, 
  escrowCount,
  currency,
  setCurrency,
  theme,
  setTheme
}) {
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  return (
    <header style={{
      background: theme === 'light' ? 'rgba(255, 255, 255, 0.92)' : 'rgba(18, 22, 34, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0.85rem 1.2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Brand Logo & Summit Tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div 
            onClick={() => setCurrentView('chat')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
          >
            <img 
              src="/kwan_logo_white_bg.png" 
              alt="Kwan Logo" 
              style={{ height: '38px', borderRadius: '6px', objectFit: 'contain' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div>
              <span style={{ 
                fontFamily: 'var(--font-display)', 
                fontSize: '1.4rem', 
                fontWeight: 900, 
                letterSpacing: '-0.03em',
                color: 'var(--text-white)'
              }}>
                Kwan<span style={{ color: 'var(--gold)' }}>.</span>
              </span>
              <span style={{ 
                display: 'block', 
                fontSize: '0.7rem', 
                color: 'var(--gold)', 
                fontFamily: 'var(--font-mono)', 
                letterSpacing: '0.06em', 
                textTransform: 'uppercase',
                fontWeight: 700 
              }}>
                Grassroots Travel AI
              </span>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <nav style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', background: 'var(--bg-card)', padding: '0.3rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setCurrentView('chat')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.5rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: currentView === 'chat' ? 'var(--gold)' : 'transparent',
              color: currentView === 'chat' ? '#0F172A' : 'var(--text-secondary)',
              fontWeight: currentView === 'chat' ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <MessageSquare size={15} />
            <span>AI Itinerary Planner</span>
          </button>

          <button 
            onClick={() => setCurrentView('hosts')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.5rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: currentView === 'hosts' ? 'var(--gold)' : 'transparent',
              color: currentView === 'hosts' ? '#0F172A' : 'var(--text-secondary)',
              fontWeight: currentView === 'hosts' ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Users size={15} />
            <span>Verified Hosts</span>
          </button>

          <button 
            onClick={() => setCurrentView('payout')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.5rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: currentView === 'payout' ? 'var(--green)' : 'transparent',
              color: currentView === 'payout' ? '#0F172A' : 'var(--text-secondary)',
              fontWeight: currentView === 'payout' ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              position: 'relative'
            }}
          >
            <Smartphone size={15} />
            <span>Host MoMo Terminal</span>
            {escrowCount > 0 && (
              <span style={{
                background: '#EF4444',
                color: '#FFF',
                borderRadius: '9999px',
                padding: '0.1rem 0.35rem',
                fontSize: '0.68rem',
                fontWeight: 800,
                marginLeft: '0.2rem'
              }}>
                {escrowCount}
              </span>
            )}
          </button>

          <button 
            onClick={() => setCurrentView('ledger')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.5rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: currentView === 'ledger' ? 'var(--cyan)' : 'transparent',
              color: currentView === 'ledger' ? '#0F172A' : 'var(--text-secondary)',
              fontWeight: currentView === 'ledger' ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Database size={15} />
            <span>Escrow Ledger</span>
          </button>
        </nav>

        {/* Global Controls: Currency Switcher & Theme Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          
          {/* Currency Switcher */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.2rem'
          }}>
            <button
              onClick={() => setCurrency('USD')}
              style={{
                padding: '0.35rem 0.6rem',
                borderRadius: '4px',
                border: 'none',
                background: currency === 'USD' ? 'var(--gold)' : 'transparent',
                color: currency === 'USD' ? '#0F172A' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              USD ($)
            </button>
            <button
              onClick={() => setCurrency('GHS')}
              style={{
                padding: '0.35rem 0.6rem',
                borderRadius: '4px',
                border: 'none',
                background: currency === 'GHS' ? 'var(--gold)' : 'transparent',
                color: currency === 'GHS' ? '#0F172A' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              GHS (₵)
            </button>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Daylight Mode' : 'Switch to Dark Mode'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {theme === 'dark' ? <Sun size={17} style={{ color: 'var(--gold)' }} /> : <Moon size={17} style={{ color: 'var(--cyan)' }} />}
          </button>
        </div>

      </div>
    </header>
  );
}
