import { useState, useEffect, useRef } from 'react'
import { fetchPlayers } from '../api/client'

export default function SearchScreen({ onEvaluate, loading, error }) {
  const [players,    setPlayers]    = useState([])
  const [query,      setQuery]      = useState('')
  const [suggestions, setSugg]     = useState([])
  const [showDrop,   setShowDrop]   = useState(false)
  const [selected,   setSelected]   = useState('')
  const [teamWins,   setTeamWins]   = useState(38)
  const [salaryAsk,  setSalaryAsk]  = useState(20)
  const [activeIdx,  setActiveIdx]  = useState(-1)
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
    if (!showDrop || !suggestions.length) return
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
    <div className="min-h-screen bg-scout-bg flex items-center justify-center px-6">
      <div className="w-full max-w-lg fade-up">

        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="font-mono text-5xl font-bold text-scout-gold tracking-tight">GOLDEN SCOUT</h1>
          <p className="text-scout-muted mt-2 text-sm">The NBA Contract Decision Engine</p>
        </div>

        <div className="bg-scout-card rounded-xl border border-scout-border p-6 space-y-4">

          {/* Player search */}
          <div className="relative">
            <label className="block font-mono text-[10px] text-scout-muted uppercase tracking-widest mb-2">
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
              placeholder="Search 562 players..."
              className={`w-full bg-scout-bg border rounded-lg px-4 py-3 text-scout-text font-mono text-sm placeholder-scout-muted focus:outline-none transition-colors
                ${error ? 'border-red-500' : 'border-scout-border focus:border-scout-teal'}`}
            />
            {showDrop && suggestions.length > 0 && (
              <ul className="absolute top-full left-0 right-0 mt-1 bg-scout-card border border-scout-border rounded-lg overflow-hidden z-50 shadow-2xl">
                {suggestions.map((name, i) => (
                  <li
                    key={name}
                    onMouseDown={() => pick(name)}
                    className={`px-4 py-2.5 font-mono text-sm cursor-pointer border-b border-scout-border last:border-0 transition-colors
                      ${i === activeIdx ? 'bg-scout-teal/10 text-scout-teal' : 'text-scout-text hover:bg-white/5'}`}
                  >
                    {name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Contract inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-[10px] text-scout-muted uppercase tracking-widest mb-2">
                Team Current Wins
              </label>
              <input
                type="number" min={0} max={82}
                value={teamWins}
                onChange={e => setTeamWins(Number(e.target.value))}
                className="w-full bg-scout-bg border border-scout-border rounded-lg px-4 py-3 text-scout-text font-mono text-sm focus:outline-none focus:border-scout-teal transition-colors"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] text-scout-muted uppercase tracking-widest mb-2">
                Salary Ask ($M)
              </label>
              <input
                type="number" min={1}
                value={salaryAsk}
                onChange={e => setSalaryAsk(Number(e.target.value))}
                className="w-full bg-scout-bg border border-scout-border rounded-lg px-4 py-3 text-scout-text font-mono text-sm focus:outline-none focus:border-scout-teal transition-colors"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!ready || loading}
            className="w-full py-3.5 bg-scout-teal text-scout-bg font-mono font-bold text-sm tracking-widest uppercase rounded-lg hover:bg-scout-teal/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98]"
          >
            {loading
              ? <span className="flex items-center justify-center gap-3">
                  <span className="w-4 h-4 border-2 border-scout-bg border-t-transparent rounded-full animate-spin" />
                  Analyzing Player...
                </span>
              : 'Evaluate Player'
            }
          </button>

          {error && (
            <p className="font-mono text-sm text-red-400 text-center">{error}</p>
          )}
        </div>

        <p className="text-center font-mono text-[10px] text-scout-muted mt-6 tracking-widest">
          10,000 SIMULATED SEASONS · POSITION-ADJUSTED Z-SCORES · GEMINI ANALYSIS
        </p>
      </div>
    </div>
  )
}