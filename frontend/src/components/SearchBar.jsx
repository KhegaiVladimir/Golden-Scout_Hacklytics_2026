// SearchBar.jsx
// Thin wrapper — SearchScreen owns the real implementation.
// Other screens can import this for a standalone search input.
import { useState, useEffect } from 'react'
import { fetchPlayers } from '../api/client'

export default function SearchBar({ onSelectPlayer, placeholder = 'Search NBA players...' }) {
  const [players,     setPlayers]  = useState([])
  const [query,       setQuery]    = useState('')
  const [suggestions, setSugg]     = useState([])
  const [showDrop,    setShowDrop] = useState(false)
  const [activeIdx,   setActive]   = useState(-1)

  useEffect(() => { fetchPlayers().then(setPlayers) }, [])
  useEffect(() => {
    if (query.length < 2) { setSugg([]); return }
    setSugg(players.filter(p => p.toLowerCase().includes(query.toLowerCase())).slice(0, 8))
    setShowDrop(true); setActive(-1)
  }, [query, players])

  function pick(name) { setQuery(name); setShowDrop(false); onSelectPlayer(name) }

  function handleKey(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(i => Math.min(i + 1, suggestions.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActive(i => Math.max(i - 1, 0)) }
    if (e.key === 'Enter')     { if (activeIdx >= 0) pick(suggestions[activeIdx]) }
    if (e.key === 'Escape')    setShowDrop(false)
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{
        display: 'flex', alignItems: 'center',
        background: 'var(--bg-0)', border: '1px solid var(--border)',
        borderRadius: 'var(--r-md)', padding: '0 4px 0 12px',
      }}
        onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--border-active)'}
        onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--border)'}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke="var(--text-3)" strokeWidth="2" style={{ flexShrink: 0 }}>
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <input
          type="text" value={query}
          onChange={e => { setQuery(e.target.value); onSelectPlayer('') }}
          onKeyDown={handleKey}
          onFocus={() => suggestions.length && setShowDrop(true)}
          onBlur={() => setTimeout(() => setShowDrop(false), 150)}
          placeholder={placeholder}
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none',
            fontFamily: 'var(--font-sans)', fontSize: '13px',
            color: 'var(--text-0)', padding: '10px 8px',
          }}
        />
      </div>
      {showDrop && suggestions.length > 0 && (
        <ul style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 50,
          background: 'var(--bg-1)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-md)', overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)', listStyle: 'none',
        }}>
          {suggestions.map((name, i) => (
            <li key={name} onMouseDown={() => pick(name)} style={{
              padding: '9px 14px',
              fontFamily: 'var(--font-sans)', fontSize: '13px', cursor: 'pointer',
              color: i === activeIdx ? 'var(--text-0)' : 'var(--text-1)',
              background: i === activeIdx ? 'var(--bg-hover)' : 'transparent',
              borderBottom: i < suggestions.length - 1 ? '1px solid var(--border)' : 'none',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = i === activeIdx ? 'var(--bg-hover)' : 'transparent'}
            >
              {name}
            </li>
          ))}
        </ul>
      )}
      <style>{`input::placeholder { color: var(--text-3); }`}</style>
    </div>
  )
}