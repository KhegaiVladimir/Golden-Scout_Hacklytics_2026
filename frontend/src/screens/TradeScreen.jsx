// TradeScreen.jsx
import { useState, useEffect, useRef } from 'react'
import { fetchPlayers, simulateTrade } from '../api/client'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts'

function binDistribution(dist, binSize = 3) {
  if (!dist?.length) return []
  const min = Math.min(...dist), max = Math.max(...dist)
  const bins = {}
  for (let w = min; w <= max; w += binSize) bins[w] = 0
  dist.forEach(w => { const bin = Math.floor(w / binSize) * binSize; bins[bin] = (bins[bin] || 0) + 1 })
  return Object.entries(bins).map(([wins, count]) => ({ wins: Number(wins), count })).sort((a, b) => a.wins - b.wins)
}

function mergeDistributions(before, after, binSize = 3) {
  const b = binDistribution(before, binSize), a = binDistribution(after, binSize)
  const winsSet = new Set([...b.map(d => d.wins), ...a.map(d => d.wins)])
  const bMap = Object.fromEntries(b.map(d => [d.wins, d.count]))
  const aMap = Object.fromEntries(a.map(d => [d.wins, d.count]))
  return Array.from(winsSet).sort((x, y) => x - y).map(wins => ({ wins, before: bMap[wins] || 0, after: aMap[wins] || 0 }))
}

function PlayerSearch({ label, value, onChange, players, placeholder }) {
  const [query, setQuery]       = useState(value || '')
  const [open, setOpen]         = useState(false)
  const [filtered, setFiltered] = useState([])
  const ref = useRef(null)

  useEffect(() => {
    if (query.length < 2) { setFiltered([]); setOpen(false); return }
    const f = players.filter(p => p.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    setFiltered(f); setOpen(f.length > 0)
  }, [query, players])

  useEffect(() => {
    const handler = e => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const select = name => { setQuery(name); onChange(name); setOpen(false) }

  return (
    <div>
      <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-3)', letterSpacing: '0.5px', marginBottom: '8px' }}>
        {label}
      </label>
      <div ref={ref} style={{ position: 'relative' }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          background: 'var(--bg-0)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-md)', padding: '0 4px 0 12px',
        }}
          onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--border-active)'}
          onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2" style={{ flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); onChange('') }}
            placeholder={placeholder}
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              fontFamily: 'var(--font-sans)', fontSize: '13px',
              color: 'var(--text-0)', padding: '10px 8px',
            }}
          />
        </div>
        {open && (
          <ul style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 50,
            background: 'var(--bg-1)', border: '1px solid var(--border)',
            borderRadius: 'var(--r-md)', overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)', listStyle: 'none',
          }}>
            {filtered.map(name => (
              <li key={name} onClick={() => select(name)} style={{
                padding: '9px 14px', fontFamily: 'var(--font-sans)', fontSize: '13px',
                cursor: 'pointer', color: 'var(--text-1)',
                borderBottom: '1px solid var(--border)',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-0)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-1)' }}
              >
                {name}
              </li>
            ))}
          </ul>
        )}
      </div>
      <style>{`input::placeholder { color: var(--text-3); }`}</style>
    </div>
  )
}

function DeltaPanel({ label, value, format, positive }) {
  const isPos     = positive ?? value > 0
  const isNeutral = value === 0
  const color = isNeutral ? 'var(--text-3)' : isPos ? 'var(--green)' : 'var(--red)'
  const subtle = isNeutral ? 'transparent' : isPos ? 'var(--green-subtle)' : 'var(--red-subtle)'
  const border = isNeutral ? 'var(--border)' : isPos ? 'var(--green-border)' : 'var(--red-border)'

  return (
    <div style={{
      background: 'var(--bg-1)', border: `1px solid ${border}`,
      borderRadius: 'var(--r-lg)', padding: '20px 24px',
      background: subtle !== 'transparent' ? subtle : 'var(--bg-1)',
      transition: 'background 0.15s ease',
    }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-3)', letterSpacing: '0.5px', marginBottom: '10px' }}>
        {label}
      </p>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '26px', fontWeight: 600, letterSpacing: '-0.6px', color }}>
        {value > 0 ? '+' : ''}{format(value)}
      </p>
    </div>
  )
}

function CustomTooltip({ active, payload, playerInName }) {
  if (!active || !payload?.length) return null
  const { wins, before, after } = payload[0].payload
  const lastName = playerInName?.split(' ').pop() ?? ''
  return (
    <div style={{
      background: 'var(--bg-1)', border: '1px solid var(--border)',
      borderRadius: 'var(--r-sm)', padding: '8px 12px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
    }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-3)', marginBottom: '4px' }}>{wins} wins</p>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-3)', marginBottom: '2px' }}>
        Before: <span style={{ color: 'var(--text-0)', fontWeight: 600 }}>{before}</span>
      </p>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-2)' }}>
        With {lastName}: <span style={{ color: 'var(--green)', fontWeight: 600 }}>{after}</span>
      </p>
    </div>
  )
}

export default function TradeScreen({ onBack, players: propPlayers }) {
  const [players,   setPlayers]   = useState(propPlayers || [])
  const [playerOut, setPlayerOut] = useState('')
  const [playerIn,  setPlayerIn]  = useState('')
  const [teamWins,  setTeamWins]  = useState(38)
  const [loading,   setLoading]   = useState(false)
  const [result,    setResult]    = useState(null)
  const [error,     setError]     = useState(null)

  useEffect(() => { if (!propPlayers?.length) fetchPlayers().then(setPlayers) }, [propPlayers])

  const canRun = playerOut && playerIn && playerOut !== playerIn

  const handleRun = async () => {
    if (!canRun) return
    setLoading(true); setError(null); setResult(null)
    const data = await simulateTrade(playerOut, playerIn, teamWins)
    if (!data) setError('Trade simulation failed. Check player names and try again.')
    else setResult(data)
    setLoading(false)
  }

  const chartData   = result ? mergeDistributions(result.before.win_distribution, result.after.win_distribution) : []
  const deltaWins   = result?.delta?.wins        ?? 0
  const deltaProb   = result?.delta?.playoff_prob ?? 0
  const deltaSalary = result?.delta?.salary_m     ?? 0

  return (
    <div style={{ minHeight: '100vh', paddingTop: '72px', paddingBottom: '64px' }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 24px' }}>

        {/* ── Header ───────────────────────────────── */}
        <div className="fade-up" style={{ marginBottom: '40px' }}>
          <button onClick={onBack} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-mono)', fontSize: '12px',
            color: 'var(--text-3)', marginBottom: '24px',
            display: 'flex', alignItems: 'center', gap: '6px',
            transition: 'color 0.15s ease', padding: 0,
          }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-1)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
          >
            ← Back
          </button>
          <h1 style={{ fontSize: '28px', fontWeight: 600, letterSpacing: '-0.6px', color: 'var(--text-0)', marginBottom: '6px' }}>
            Trade Simulator
          </h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-3)' }}>
            How does your win distribution shift when you make this trade?
          </p>
        </div>

        {/* ── Input panel ──────────────────────────── */}
        <div className="fade-up-1" style={{
          background: 'var(--bg-1)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)', padding: '24px', marginBottom: '1px',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <PlayerSearch label="TRADING AWAY" value={playerOut} onChange={setPlayerOut} players={players} placeholder="Player leaving your team..." />
              {result && (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-3)', marginTop: '8px' }}>
                  Impact <span style={{ color: 'var(--red)' }}>{result.player_out.impact_score.toFixed(3)}</span>
                  {' · '}{result.player_out.position}
                  {' · '}<span style={{ color: 'var(--text-1)' }}>${result.player_out.salary_m.toFixed(1)}M</span>
                </p>
              )}
            </div>
            <div>
              <PlayerSearch label="RECEIVING" value={playerIn} onChange={setPlayerIn} players={players} placeholder="Player joining your team..." />
              {result && (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-3)', marginTop: '8px' }}>
                  Impact <span style={{ color: 'var(--green)' }}>{result.player_in.impact_score.toFixed(3)}</span>
                  {' · '}{result.player_in.position}
                  {' · '}<span style={{ color: 'var(--text-1)' }}>${result.player_in.salary_m.toFixed(1)}M</span>
                </p>
              )}
            </div>
          </div>

          {/* Team wins + button */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
            <div style={{
              background: 'var(--bg-0)', border: '1px solid var(--border)',
              borderRadius: 'var(--r-md)', padding: '12px 16px', width: '120px',
            }}>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-3)', letterSpacing: '0.5px', marginBottom: '6px' }}>
                TEAM WINS
              </label>
              <input
                type="number" min={0} max={82} value={teamWins}
                onChange={e => setTeamWins(Number(e.target.value))}
                style={{
                  width: '100%', background: 'none', border: 'none', outline: 'none',
                  fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: 600,
                  color: 'var(--text-0)', letterSpacing: '-0.5px', MozAppearance: 'textfield',
                }}
              />
            </div>

            <button
              onClick={handleRun}
              disabled={!canRun || loading}
              style={{
                flex: 1, padding: '11px 16px',
                background: canRun && !loading ? 'var(--text-0)' : 'var(--bg-3)',
                color: canRun && !loading ? 'var(--bg-0)' : 'var(--text-3)',
                border: 'none', borderRadius: 'var(--r-md)',
                fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500,
                cursor: canRun && !loading ? 'pointer' : 'not-allowed',
                letterSpacing: '-0.1px', transition: 'opacity 0.15s ease',
              }}
              onMouseEnter={e => { if (canRun && !loading) e.currentTarget.style.opacity = '0.88' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span style={{ width: '12px', height: '12px', border: '1.5px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                  Simulating 10,000 seasons...
                </span>
              ) : 'Simulate Trade →'}
            </button>
          </div>

          {error && (
            <div style={{ marginTop: '12px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--red)', background: 'var(--red-subtle)', border: '1px solid var(--red-border)', borderRadius: 'var(--r-sm)', padding: '10px 14px' }}>
              {error}
            </div>
          )}
        </div>

        {/* ── Results ──────────────────────────────── */}
        {result && (
          <>
            {/* Delta strip */}
            <div className="fade-up" style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1px', background: 'var(--border)',
              borderRadius: 'var(--r-lg)', overflow: 'hidden',
              marginTop: '1px', marginBottom: '1px',
            }}>
              <DeltaPanel label="Win Change"          value={deltaWins}   format={v => `${v}W`} />
              <DeltaPanel label="Playoff Probability" value={deltaProb}   format={v => `${v}%`} />
              <DeltaPanel label="Salary Impact"       value={deltaSalary} format={v => `$${Math.abs(v).toFixed(1)}M`} positive={deltaSalary <= 0} />
            </div>

            {/* Chart */}
            <div className="fade-up-1" style={{
              background: 'var(--bg-1)', border: '1px solid var(--border)',
              borderRadius: 'var(--r-lg)', padding: '24px',
              marginBottom: '1px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-3)', letterSpacing: '0.3px', marginBottom: '3px' }}>
                    Win distribution shift
                  </p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-3)', opacity: 0.6 }}>
                    10,000 simulated seasons — before vs. after trade
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '16px', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-3)', alignItems: 'center' }}>
                  {[
                    { color: 'var(--text-3)', label: `Without ${result.player_in.name?.split(' ').pop()}` },
                    { color: 'var(--text-0)', label: `With ${result.player_in.name?.split(' ').pop()}` },
                  ].map(({ color, label }) => (
                    <span key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '20px', height: '1px', background: color, display: 'inline-block' }} />
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={chartData} margin={{ top: 4, right: 8, left: -24, bottom: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="wins" tick={{ fill: '#444444', fontSize: 10, fontFamily: 'Geist Mono, monospace' }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} tickLine={false}
                    label={{ value: 'Season Wins', position: 'insideBottom', offset: -8, fill: '#444444', fontSize: 10, fontFamily: 'Geist Mono, monospace' }}
                  />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip playerInName={result.player_in.name} />} cursor={{ stroke: 'rgba(255,255,255,0.06)' }} />
                  <ReferenceLine x={41} stroke="rgba(255,255,255,0.10)" strokeDasharray="3 3" strokeWidth={1}
                    label={{ value: 'Playoff', fill: '#444444', fontSize: 9, fontFamily: 'Geist Mono, monospace' }}
                  />
                  <Line type="monotone" dataKey="before" stroke="rgba(255,255,255,0.15)" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="after"  stroke="rgba(255,255,255,0.70)" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Before / After summary */}
            <div className="fade-up-2" style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: '1px', background: 'var(--border)',
              borderRadius: 'var(--r-lg)', overflow: 'hidden',
            }}>
              {[
                { title: 'Before Trade', data: result.before, color: 'var(--text-0)', isAfter: false },
                { title: 'After Trade',  data: result.after,  color: deltaWins >= 0 ? 'var(--green)' : 'var(--red)', isAfter: true },
              ].map(({ title, data, color, isAfter }) => (
                <div key={title} style={{ background: 'var(--bg-1)', padding: '20px 24px' }}>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-3)', letterSpacing: '0.5px', marginBottom: '14px' }}>
                    {title}
                  </p>
                  {[
                    { label: 'Expected Wins', value: data.expected_wins },
                    { label: 'Playoff Prob.', value: `${data.playoff_prob}%` },
                  ].map(({ label, value }, i, arr) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-3)' }}>{label}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600, color: isAfter ? color : 'var(--text-0)' }}>{value}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <style>{`
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}