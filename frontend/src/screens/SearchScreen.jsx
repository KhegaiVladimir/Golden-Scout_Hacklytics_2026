import { useState, useEffect, useRef } from 'react'
import { fetchPlayers } from '../api/client'

export default function SearchScreen({ onEvaluate, loading, error }) {
  const [players,    setPlayers]   = useState([])
  const [query,      setQuery]     = useState('')
  const [suggestions, setSugg]    = useState([])
  const [showDrop,   setShowDrop]  = useState(false)
  const [selected,   setSelected]  = useState('')
  const [teamWins,   setTeamWins]  = useState(38)
  const [salaryAsk,  setSalary]    = useState(20)
  const [activeIdx,  setActiveIdx] = useState(-1)
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
    setSelected(name)
    setQuery(name)
    setShowDrop(false)
  }

  function handleKey(e) {
    if (!showDrop || !suggestions.length) {
      if (e.key === 'Enter') handleSubmit()
      return
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
    <div className="min-h-screen flex items-center justify-center px-6 relative">
      {/* radial spotlight */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(0,201,224,0.04) 0%, transparent 70%)' }} />

      <div className="relative z-10 w-full max-w-md fade-up">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-scout-teal" style={{ boxShadow: '0 0 8px #00C9E0' }} />
            <span className="font-mono text-[10px] tracking-[4px] text-scout-teal uppercase">Hacklytics 2026</span>
          </div>
          <h1 className="font-mono text-6xl font-bold text-scout-gold tracking-tight leading-none">
            GOLDEN
          </h1>
          <h1 className="font-mono text-6xl font-bold text-scout-gold tracking-tight leading-none mb-3">
            SCOUT
          </h1>
          <p className="text-scout-dim text-sm font-light tracking-wide">The NBA Contract Decision Engine</p>
        </div>

        {/* Card */}
        <div className="bg-scout-card border border-scout-border rounded-2xl p-6 shadow-card space-y-4">

          {/* Search */}
          <div className="relative">
            <label className="block font-mono text-[10px] text-scout-muted uppercase tracking-[2px] mb-2">
              Player Name
            </label>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setSelected('') }}
              onKeyDown={handleKey}
              onFocus={() => suggestions.length && setShowDrop(true)}
              onBlur={() => setTimeout(() => setShowDrop(false), 150)}
              placeholder="Search 562 NBA players..."
              className={`w-full bg-scout-bg border rounded-xl px-4 py-3 text-scout-text font-mono text-sm placeholder-scout-muted/50 focus:outline-none transition-all
                ${error ? 'border-scout-red/60' : 'border-scout-border focus:border-scout-teal/60'}`}
            />
            {showDrop && suggestions.length > 0 && (
              <ul className="absolute top-full left-0 right-0 mt-1.5 bg-scout-card border border-scout-border rounded-xl overflow-hidden z-50 shadow-card">
                {suggestions.map((name, i) => (
                  <li
                    key={name}
                    onMouseDown={() => pick(name)}
                    className={`px-4 py-2.5 font-mono text-sm cursor-pointer transition-colors border-b border-scout-border/50 last:border-0
                      ${i === activeIdx ? 'bg-scout-teal/10 text-scout-teal' : 'text-scout-dim hover:bg-scout-card2 hover:text-scout-text'}`}
                  >
                    {name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-[10px] text-scout-muted uppercase tracking-[2px] mb-2">
                Team Wins
              </label>
              <input
                type="number" min={0} max={82}
                value={teamWins}
                onChange={e => setTeamWins(Number(e.target.value))}
                className="w-full bg-scout-bg border border-scout-border rounded-xl px-4 py-3 text-scout-text font-mono text-sm focus:outline-none focus:border-scout-teal/60 transition-all"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] text-scout-muted uppercase tracking-[2px] mb-2">
                Salary Ask ($M)
              </label>
              <input
                type="number" min={1}
                value={salaryAsk}
                onChange={e => setSalary(Number(e.target.value))}
                className="w-full bg-scout-bg border border-scout-border rounded-xl px-4 py-3 text-scout-text font-mono text-sm focus:outline-none focus:border-scout-teal/60 transition-all"
              />
            </div>
          </div>

          {/* Button */}
          <button
            onClick={handleSubmit}
            disabled={!ready || loading}
            className="w-full py-3.5 rounded-xl font-mono font-bold text-sm tracking-[2px] uppercase transition-all duration-200 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
            style={ready && !loading ? {
              background: 'linear-gradient(135deg, #00C9E0, #0099B8)',
              color: '#050810',
              boxShadow: '0 0 20px rgba(0,201,224,0.25)',
            } : {
              background: '#0d1117',
              color: '#4B5C6B',
              border: '1px solid #1c2333',
            }}
          >
            {loading
              ? <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Analyzing...
                </span>
              : 'Evaluate Player →'
            }
          </button>

          {error && (
            <p className="font-mono text-xs text-scout-red text-center pt-1">{error}</p>
          )}
        </div>

        <p className="text-center font-mono text-[10px] text-scout-muted/60 mt-6 tracking-[2px] uppercase">
          10,000 simulated seasons · Position-adjusted z-scores · Gemini AI
        </p>
      </div>
    </div>
  )
}