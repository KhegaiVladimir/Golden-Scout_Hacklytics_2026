import { useState, useEffect, useRef } from 'react'
import { fetchPlayers } from '../api/client'

const HINTS = [
  'Nikola Jokić', 'Luka Dončić', 'Jayson Tatum',
  'Shai Gilgeous-Alexander', 'Anthony Edwards', 'Giannis Antetokounmpo',
]

export default function SearchScreen({ onEvaluate, loading, error }) {
  const [players,     setPlayers]   = useState([])
  const [query,       setQuery]     = useState('')
  const [suggestions, setSugg]      = useState([])
  const [showDrop,    setShowDrop]  = useState(false)
  const [selected,    setSelected]  = useState('')
  const [teamWins,    setTeamWins]  = useState(38)
  const [salaryAsk,   setSalary]    = useState(20)
  const [activeIdx,   setActiveIdx] = useState(-1)
  const inputRef = useRef(null)

  useEffect(() => { fetchPlayers().then(setPlayers) }, [])

  useEffect(() => {
    if (query.length < 2) { setSugg([]); return }
    const q = query.toLowerCase()
    setSugg(players.filter(p => p.toLowerCase().includes(q)).slice(0, 8))
    setShowDrop(true)
    setActiveIdx(-1)
  }, [query, players])

  function pick(name) {
    setSelected(name); setQuery(name); setShowDrop(false)
  }

  function handleKey(e) {
    if (!showDrop || !suggestions.length) {
      if (e.key === 'Enter') handleSubmit(); return
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, suggestions.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)) }
    if (e.key === 'Enter')     { if (activeIdx >= 0) pick(suggestions[activeIdx]); else handleSubmit() }
    if (e.key === 'Escape')    setShowDrop(false)
  }

  function handleSubmit() {
    const player = selected || query.trim()
    if (!player || loading) return
    onEvaluate(player, teamWins, salaryAsk)
  }

  const ready = !!(selected || query.trim())

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 24px',
    }}>
      <div className="fade-up" style={{ width: '100%', maxWidth: '440px' }}>

        {/* ── Logo block ───────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>

          {/* Status pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            fontFamily: 'var(--font-mono)', fontSize: '11px',
            color: 'var(--text-2)', padding: '4px 12px 4px 8px',
            border: '1px solid var(--border)', borderRadius: '999px',
            background: 'var(--bg-1)', marginBottom: '28px',
            letterSpacing: '0.3px',
          }}>
            <span style={{
              width: '5px', height: '5px', borderRadius: '50%',
              background: 'var(--green)',
            }} />
            Hacklytics 2026 · Sports Analytics Track
          </div>

          {/* Wordmark */}
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'clamp(42px, 8vw, 56px)',
            fontWeight: 600,
            letterSpacing: '-2px',
            lineHeight: 1,
            color: 'var(--text-0)',
            marginBottom: '12px',
          }}>
            Golden Scout
          </div>

          {/* Sub */}
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--text-3)',
            letterSpacing: '0.3px',
          }}>
            NBA contract decisions, backed by data.
          </p>
        </div>

        {/* ── Main card ────────────────────────────── */}
        <div style={{
          background: 'var(--bg-1)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>

          {/* Search input */}
          <div>
            <label style={{
              display: 'block',
              fontFamily: 'var(--font-mono)', fontSize: '10px',
              color: 'var(--text-3)', letterSpacing: '0.5px',
              marginBottom: '8px',
            }}>
              PLAYER
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{
                display: 'flex', alignItems: 'center',
                background: 'var(--bg-0)',
                border: `1px solid ${error ? 'var(--red)' : 'var(--border)'}`,
                borderRadius: 'var(--r-md)',
                padding: '0 4px 0 12px',
                transition: 'border-color 0.15s ease',
              }}
                onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--border-active)'}
                onBlurCapture={e => e.currentTarget.style.borderColor = error ? 'var(--red)' : 'var(--border)'}
              >
                {/* Search icon */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="var(--text-3)" strokeWidth="2" style={{ flexShrink: 0 }}>
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => { setQuery(e.target.value); setSelected('') }}
                  onKeyDown={handleKey}
                  onFocus={() => suggestions.length && setShowDrop(true)}
                  onBlur={() => setTimeout(() => setShowDrop(false), 150)}
                  placeholder="Search 562 NBA players..."
                  style={{
                    flex: 1, background: 'none', border: 'none', outline: 'none',
                    fontFamily: 'var(--font-sans)', fontSize: '14px',
                    color: 'var(--text-0)', padding: '11px 8px',
                    letterSpacing: '-0.1px',
                  }}
                  // placeholder color via global style below
                />
              </div>

              {/* Dropdown */}
              {showDrop && suggestions.length > 0 && (
                <ul style={{
                  position: 'absolute', top: 'calc(100% + 4px)',
                  left: 0, right: 0, zIndex: 50,
                  background: 'var(--bg-1)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r-md)',
                  overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                  listStyle: 'none',
                }}>
                  {suggestions.map((name, i) => (
                    <li
                      key={name}
                      onMouseDown={() => pick(name)}
                      style={{
                        padding: '10px 14px',
                        fontFamily: 'var(--font-sans)', fontSize: '13px',
                        cursor: 'pointer',
                        color: i === activeIdx ? 'var(--text-0)' : 'var(--text-1)',
                        background: i === activeIdx ? 'var(--bg-hover)' : 'transparent',
                        borderBottom: i < suggestions.length - 1 ? '1px solid var(--border)' : 'none',
                        transition: 'background 0.1s ease',
                        letterSpacing: '-0.1px',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = i === activeIdx ? 'var(--bg-hover)' : 'transparent'}
                    >
                      {name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* ── Two inputs ───────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px',
            background: 'var(--border)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
            {[
              { label: 'TEAM WINS', value: teamWins, set: setTeamWins, min: 0,  max: 82 },
              { label: 'SALARY ASK ($M)', value: salaryAsk, set: setSalary,  min: 1,  max: 999 },
            ].map(({ label, value, set, min, max }) => (
              <div key={label} style={{ background: 'var(--bg-0)', padding: '14px 16px' }}>
                <label style={{
                  display: 'block',
                  fontFamily: 'var(--font-mono)', fontSize: '10px',
                  color: 'var(--text-3)', letterSpacing: '0.5px',
                  marginBottom: '6px',
                }}>
                  {label}
                </label>
                <input
                  type="number" min={min} max={max}
                  value={value}
                  onChange={e => set(Number(e.target.value))}
                  style={{
                    width: '100%', background: 'none', border: 'none', outline: 'none',
                    fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: 600,
                    color: 'var(--text-0)', letterSpacing: '-0.5px',
                    /* hide number spinners */
                    MozAppearance: 'textfield',
                  }}
                />
              </div>
            ))}
          </div>

          {/* ── Evaluate button ─────────────────────── */}
          <button
            onClick={handleSubmit}
            disabled={!ready || loading}
            style={{
              width: '100%', padding: '11px 16px',
              background: ready && !loading ? 'var(--text-0)' : 'var(--bg-3)',
              color: ready && !loading ? 'var(--bg-0)' : 'var(--text-3)',
              border: 'none', borderRadius: 'var(--r-md)',
              fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500,
              cursor: ready && !loading ? 'pointer' : 'not-allowed',
              letterSpacing: '-0.1px',
              transition: 'opacity 0.15s ease',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
            onMouseEnter={e => { if (ready && !loading) e.currentTarget.style.opacity = '0.88' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
            onMouseDown={e => { if (ready && !loading) e.currentTarget.style.opacity = '0.72' }}
            onMouseUp={e => { if (ready && !loading) e.currentTarget.style.opacity = '0.88' }}
          >
            {loading ? (
              <>
                <span style={{
                  width: '13px', height: '13px',
                  border: '1.5px solid currentColor',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'spin 0.7s linear infinite',
                }} />
                Analyzing...
              </>
            ) : 'Evaluate Player'}
          </button>

          {/* Error */}
          {error && (
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: '11px',
              color: 'var(--red)', textAlign: 'center',
              paddingTop: '2px', letterSpacing: '0.2px',
            }}>
              {error}
            </p>
          )}
        </div>

        {/* ── Quick-pick hints ─────────────────────── */}
        <div style={{
          display: 'flex', flexWrap: 'wrap',
          justifyContent: 'center', gap: '6px',
          marginTop: '16px',
        }}>
          {HINTS.map(name => (
            <button
              key={name}
              onClick={() => pick(name)}
              style={{
                fontFamily: 'var(--font-mono)', fontSize: '11px',
                color: 'var(--text-3)', padding: '4px 10px',
                background: 'none',
                border: '1px solid transparent',
                borderRadius: '999px', cursor: 'pointer',
                transition: 'all 0.15s ease',
                letterSpacing: '0.2px',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = 'var(--text-1)'
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.background = 'var(--bg-2)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'var(--text-3)'
                e.currentTarget.style.borderColor = 'transparent'
                e.currentTarget.style.background = 'none'
              }}
            >
              {name}
            </button>
          ))}
        </div>

        {/* ── Footer meta ──────────────────────────── */}
        <p style={{
          textAlign: 'center',
          fontFamily: 'var(--font-mono)', fontSize: '10px',
          color: 'var(--text-3)', marginTop: '24px',
          letterSpacing: '0.3px',
        }}>
          10,000 simulated seasons · Position-adjusted z-scores · Gemini AI
        </p>

      </div>

      {/* Spin keyframe (can't do it inline) */}
      <style>{`
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
        input::placeholder { color: var(--text-3); }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}