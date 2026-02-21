import { useState, useEffect, useRef } from 'react'
import { fetchPlayers, simulateTrade } from '../api/client'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts'

// Bin 10k raw ints into histogram bins
function binDistribution(dist, binSize = 3) {
  if (!dist?.length) return []
  const min = Math.min(...dist)
  const max = Math.max(...dist)
  const bins = {}
  for (let w = min; w <= max; w += binSize) bins[w] = 0
  dist.forEach(w => {
    const bin = Math.floor(w / binSize) * binSize
    bins[bin] = (bins[bin] || 0) + 1
  })
  return Object.entries(bins)
    .map(([wins, count]) => ({ wins: Number(wins), count }))
    .sort((a, b) => a.wins - b.wins)
}

// Merge before/after into one array for overlaid chart
function mergeDistributions(before, after, binSize = 3) {
  const b = binDistribution(before, binSize)
  const a = binDistribution(after, binSize)
  const winsSet = new Set([...b.map(d => d.wins), ...a.map(d => d.wins)])
  const bMap = Object.fromEntries(b.map(d => [d.wins, d.count]))
  const aMap = Object.fromEntries(a.map(d => [d.wins, d.count]))
  return Array.from(winsSet).sort((x, y) => x - y).map(wins => ({
    wins,
    before: bMap[wins] || 0,
    after:  aMap[wins] || 0,
  }))
}

function PlayerSearch({ label, value, onChange, players, placeholder }) {
  const [query, setQuery]       = useState(value || '')
  const [open, setOpen]         = useState(false)
  const [filtered, setFiltered] = useState([])
  const ref = useRef(null)

  useEffect(() => {
    if (query.length < 2) { setFiltered([]); setOpen(false); return }
    const f = players.filter(p => p.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    setFiltered(f)
    setOpen(f.length > 0)
  }, [query, players])

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const select = (name) => {
    setQuery(name)
    onChange(name)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <label className="block font-mono text-xs text-scout-muted uppercase tracking-widest mb-2">{label}</label>
      <input
        value={query}
        onChange={e => { setQuery(e.target.value); onChange('') }}
        placeholder={placeholder}
        className="w-full bg-scout-card2 border border-scout-border rounded-xl px-4 py-3 font-mono text-sm text-scout-text placeholder-scout-muted focus:outline-none focus:border-scout-teal transition-colors"
      />
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-scout-card border border-scout-border rounded-xl overflow-hidden shadow-card">
          {filtered.map(name => (
            <button
              key={name}
              onClick={() => select(name)}
              className="w-full text-left px-4 py-2.5 font-mono text-sm text-scout-text hover:bg-scout-card2 transition-colors"
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function DeltaCard({ label, value, format, positive }) {
  const isPositive = positive ?? value > 0
  const isNeutral  = value === 0
  const color = isNeutral ? 'text-scout-muted' : isPositive ? 'text-scout-green' : 'text-scout-red'
  const bg    = isNeutral ? '' : isPositive ? 'bg-scout-green/5 border-scout-green/20' : 'bg-scout-red/5 border-scout-red/20'

  return (
    <div className={`bg-scout-card border ${bg || 'border-scout-border'} rounded-2xl p-5 text-center`}>
      <div className="font-mono text-xs text-scout-muted uppercase tracking-widest mb-2">{label}</div>
      <div className={`font-mono text-3xl font-bold ${color}`}>
        {value > 0 ? '+' : ''}{format(value)}
      </div>
    </div>
  )
}

export default function TradeScreen({ onBack, players: propPlayers }) {
  const [players, setPlayers]     = useState(propPlayers || [])
  const [playerOut, setPlayerOut] = useState('')
  const [playerIn,  setPlayerIn]  = useState('')
  const [teamWins,  setTeamWins]  = useState(38)
  const [loading, setLoading]     = useState(false)
  const [result,  setResult]      = useState(null)
  const [error,   setError]       = useState(null)

  useEffect(() => {
    if (!propPlayers?.length) fetchPlayers().then(setPlayers)
  }, [propPlayers])

  const canRun = playerOut && playerIn && playerOut !== playerIn

  const handleRun = async () => {
    if (!canRun) return
    setLoading(true)
    setError(null)
    setResult(null)
    const data = await simulateTrade(playerOut, playerIn, teamWins)
    if (!data) {
      setError('Trade simulation failed. Check player names and try again.')
    } else {
      setResult(data)
    }
    setLoading(false)
  }

  const chartData = result
    ? mergeDistributions(result.before.win_distribution, result.after.win_distribution)
    : []

  const deltaWins   = result?.delta?.wins        ?? 0
  const deltaProb   = result?.delta?.playoff_prob ?? 0
  const deltaSalary = result?.delta?.salary_m     ?? 0

  return (
    <div className="min-h-screen bg-scout-bg pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-6">

        {/* Header */}
        <div className="fade-up mb-10">
          <button onClick={onBack} className="font-mono text-xs text-scout-muted hover:text-scout-teal transition-colors mb-6 flex items-center gap-2">
            ← Back
          </button>
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-xs bg-scout-teal/10 text-scout-teal border border-scout-teal/20 px-3 py-1 rounded-full uppercase tracking-widest">
              Trade Simulator
            </span>
          </div>
          <h1 className="text-3xl font-bold text-scout-text">
            Trade Impact Simulator
          </h1>
          <p className="text-scout-muted font-mono text-sm mt-2">
            How does your win distribution shift if you make this trade?
          </p>
        </div>

        {/* Input card */}
        <div className="fade-up-1 bg-scout-card border border-scout-border rounded-2xl p-6 mb-6 shadow-card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <PlayerSearch
                label="Trading Away"
                value={playerOut}
                onChange={setPlayerOut}
                players={players}
                placeholder="Player leaving your team..."
              />
              {result && (
                <div className="mt-2 font-mono text-xs text-scout-muted">
                  Impact: <span className="text-scout-red">{result.player_out.impact_score.toFixed(3)}</span>
                  {' · '}{result.player_out.position}
                  {' · '}<span className="text-scout-text">${result.player_out.salary_m.toFixed(1)}M</span>
                </div>
              )}
            </div>

            <div>
              <PlayerSearch
                label="Receiving"
                value={playerIn}
                onChange={setPlayerIn}
                players={players}
                placeholder="Player joining your team..."
              />
              {result && (
                <div className="mt-2 font-mono text-xs text-scout-muted">
                  Impact: <span className="text-scout-green">{result.player_in.impact_score.toFixed(3)}</span>
                  {' · '}{result.player_in.position}
                  {' · '}<span className="text-scout-text">${result.player_in.salary_m.toFixed(1)}M</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-end gap-6">
            <div>
              <label className="block font-mono text-xs text-scout-muted uppercase tracking-widest mb-2">
                Current Team Wins
              </label>
              <input
                type="number"
                min={0} max={82}
                value={teamWins}
                onChange={e => setTeamWins(Number(e.target.value))}
                className="w-32 bg-scout-card2 border border-scout-border rounded-xl px-4 py-3 font-mono text-sm text-scout-text focus:outline-none focus:border-scout-teal transition-colors"
              />
            </div>

            <button
              onClick={handleRun}
              disabled={!canRun || loading}
              className="flex-1 py-3 rounded-xl font-mono text-sm font-bold uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: canRun && !loading
                  ? 'linear-gradient(135deg, #00C9E0, #0099B8)'
                  : undefined,
                backgroundColor: !canRun || loading ? '#1c2333' : undefined,
                color: canRun && !loading ? '#050810' : '#4B5C6B',
                boxShadow: canRun && !loading ? '0 0 20px rgba(0,201,224,0.25)' : 'none',
              }}
            >
              {loading ? 'Simulating 10,000 seasons...' : 'Simulate Trade →'}
            </button>
          </div>

          {error && (
            <div className="mt-4 font-mono text-xs text-scout-red bg-scout-red/10 border border-scout-red/20 rounded-lg px-4 py-3">
              {error}
            </div>
          )}
        </div>

        {/* Results */}
        {result && (
          <>
            {/* Delta cards */}
            <div className="fade-up grid grid-cols-3 gap-4 mb-6">
              <DeltaCard
                label="Win Change"
                value={deltaWins}
                format={v => `${v} W`}
              />
              <DeltaCard
                label="Playoff Probability"
                value={deltaProb}
                format={v => `${v}%`}
              />
              <DeltaCard
                label="Salary Impact"
                value={deltaSalary}
                format={v => `$${Math.abs(v).toFixed(1)}M`}
                positive={deltaSalary <= 0}
              />
            </div>

            {/* Overlaid histogram */}
            <div className="fade-up-1 bg-scout-card border border-scout-border rounded-2xl p-6 shadow-card">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-mono text-sm font-bold text-scout-text uppercase tracking-widest">
                    Win Distribution Shift
                  </h2>
                  <p className="font-mono text-xs text-scout-muted mt-1">
                    10,000 simulated seasons — before vs. after trade
                  </p>
                </div>
                <div className="flex items-center gap-6 font-mono text-xs">
                  <span className="flex items-center gap-2">
                    <span className="w-8 h-0.5 bg-scout-red inline-block rounded" />
                    <span className="text-scout-muted">Without {result.player_in.name.split(' ').pop()}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-8 h-0.5 bg-scout-teal inline-block rounded" />
                    <span className="text-scout-muted">With {result.player_in.name.split(' ').pop()}</span>
                  </span>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c2333" />
                  <XAxis
                    dataKey="wins"
                    tick={{ fill: '#4B5C6B', fontFamily: 'DM Mono', fontSize: 11 }}
                    label={{ value: 'Season Wins', position: 'insideBottom', offset: -2, fill: '#4B5C6B', fontFamily: 'DM Mono', fontSize: 11 }}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ background: '#0d1117', border: '1px solid #1c2333', borderRadius: 8, fontFamily: 'DM Mono', fontSize: 12 }}
                    labelStyle={{ color: '#8899AA' }}
                    formatter={(val, name) => [val, name === 'before' ? `Without ${result.player_in.name.split(' ').pop()}` : `With ${result.player_in.name.split(' ').pop()}`]}
                    labelFormatter={l => `${l} wins`}
                  />
                  <ReferenceLine x={41} stroke="#4B5C6B" strokeDasharray="4 4" label={{ value: 'Playoff', fill: '#4B5C6B', fontSize: 10, fontFamily: 'DM Mono' }} />
                  <Line type="monotone" dataKey="before" stroke="#EF4444" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="after"  stroke="#00C9E0" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Summary row */}
            <div className="fade-up-2 mt-6 bg-scout-card border border-scout-border rounded-2xl p-5 shadow-card">
              <div className="grid grid-cols-2 gap-8 font-mono text-sm">
                <div>
                  <div className="text-scout-muted text-xs uppercase tracking-widest mb-3">Before Trade</div>
                  <div className="flex justify-between py-1.5 border-b border-scout-border/40">
                    <span className="text-scout-muted">Expected Wins</span>
                    <span className="text-scout-text">{result.before.expected_wins}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-scout-muted">Playoff Probability</span>
                    <span className="text-scout-text">{result.before.playoff_prob}%</span>
                  </div>
                </div>
                <div>
                  <div className="text-scout-muted text-xs uppercase tracking-widest mb-3">After Trade</div>
                  <div className="flex justify-between py-1.5 border-b border-scout-border/40">
                    <span className="text-scout-muted">Expected Wins</span>
                    <span className={deltaWins >= 0 ? 'text-scout-green' : 'text-scout-red'}>{result.after.expected_wins}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-scout-muted">Playoff Probability</span>
                    <span className={deltaProb >= 0 ? 'text-scout-green' : 'text-scout-red'}>{result.after.playoff_prob}%</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}