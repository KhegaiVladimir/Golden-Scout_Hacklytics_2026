// frontend/src/screens/CompareScreen.jsx
import { useState, useEffect, useRef } from 'react'
import { fetchProfile, runSimulation, calculateValue, generateCompareVerdict } from '../api/client'

function fmtMoney(v) {
  if (v == null) return 'N/A'
  return v < 0 ? `-$${Math.abs(v).toFixed(1)}M` : `$${v.toFixed(1)}M`
}

function PlayerSearch({ label, value, onChange, players, salary, onSalary }) {
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
    <div style={{
      background: 'var(--bg-1)', border: '1px solid var(--border)',
      borderRadius: 'var(--r-lg)', padding: '20px',
      display: 'flex', flexDirection: 'column', gap: '12px',
      // NO overflow:hidden here — that's what was clipping the dropdown
    }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-3)', letterSpacing: '0.5px' }}>
        {label}
      </p>

      {/* Search input + dropdown — isolated stacking context */}
      <div ref={ref} style={{ position: 'relative', zIndex: 10 }}>
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
          <input value={query} onChange={e => { setQuery(e.target.value); onChange('') }}
            placeholder="Search player..."
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              fontFamily: 'var(--font-sans)', fontSize: '13px',
              color: 'var(--text-0)', padding: '10px 8px',
            }}
          />
        </div>

        {/* Dropdown — position:fixed so it CANNOT be clipped by any parent overflow */}
        {open && (
          <ul style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
            zIndex: 9999,
            background: 'var(--bg-1)', border: '1px solid var(--border)',
            borderRadius: 'var(--r-md)', overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
            listStyle: 'none', margin: 0, padding: 0,
          }}>
            {filtered.map(name => (
              <li key={name}
                onMouseDown={e => { e.preventDefault(); select(name) }}
                style={{
                  padding: '10px 14px',
                  fontFamily: 'var(--font-sans)', fontSize: '13px',
                  cursor: 'pointer', color: 'var(--text-1)',
                  borderBottom: '1px solid var(--border)',
                  transition: 'background 0.1s ease',
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

      {/* Salary input */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-3)' }}>Salary ask</span>
        <div style={{
          background: 'var(--bg-0)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-sm)', padding: '4px 10px',
          display: 'flex', alignItems: 'center', gap: '4px',
        }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-2)' }}>$</span>
          <input type="number" value={salary} onChange={e => onSalary(Number(e.target.value))} min={1} max={200}
            style={{
              width: '48px', background: 'none', border: 'none', outline: 'none',
              fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600,
              color: 'var(--text-0)', MozAppearance: 'textfield',
            }}
          />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-3)' }}>M</span>
        </div>
      </div>
    </div>
  )
}

function StatRow({ label, v1, v2, format = v => v, higherIsBetter = true }) {
  const n1 = typeof v1 === 'number' ? v1 : null
  const n2 = typeof v2 === 'number' ? v2 : null
  const p1Better = n1 != null && n2 != null && (higherIsBetter ? n1 > n2 : n1 < n2)
  const p2Better = n1 != null && n2 != null && (higherIsBetter ? n2 > n1 : n2 < n1)
  const cellColor = better => better ? 'var(--text-0)' : 'var(--text-2)'

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '8px', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', textAlign: 'right', fontWeight: p1Better ? 600 : 400, color: cellColor(p1Better) }}>
        {n1 != null ? format(n1) : (v1 != null ? format(v1) : '—')}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-3)', letterSpacing: '0.3px', textAlign: 'center', alignSelf: 'center', minWidth: '80px' }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', textAlign: 'left', fontWeight: p2Better ? 600 : 400, color: cellColor(p2Better) }}>
        {n2 != null ? format(n2) : (v2 != null ? format(v2) : '—')}
      </div>
    </div>
  )
}

function VerdictBadge({ decision }) {
  const cfg = {
    SIGN:      { color: 'var(--green)', subtle: 'var(--green-subtle)', border: 'var(--green-border)', label: '✓ SIGN' },
    NEGOTIATE: { color: 'var(--amber)', subtle: 'var(--amber-subtle)', border: 'var(--amber-border)', label: '⟳ NEGOTIATE' },
    AVOID:     { color: 'var(--red)',   subtle: 'var(--red-subtle)',   border: 'var(--red-border)',   label: '✕ AVOID' },
  }[decision] || { color: 'var(--text-3)', subtle: 'transparent', border: 'var(--border)', label: decision }

  return (
    <span style={{
      fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 600,
      color: cfg.color, background: cfg.subtle,
      border: `1px solid ${cfg.border}`,
      padding: '2px 10px', borderRadius: '999px', letterSpacing: '0.3px',
    }}>
      {cfg.label}
    </span>
  )
}

function RiskLabel({ value }) {
  const color = value === 'LOW RISK' ? 'var(--green)' : value === 'MODERATE RISK' ? 'var(--amber)' : 'var(--red)'
  return <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color }}>{value}</span>
}

export default function CompareScreen({ onBack, players }) {
  const [name1, setName1]      = useState('')
  const [name2, setName2]      = useState('')
  const [salary1, setSalary1]  = useState(20)
  const [salary2, setSalary2]  = useState(20)
  const [result, setResult]    = useState(null)
  const [loading, setLoading]  = useState(false)
  const [error, setError]      = useState(null)
  const [aiVerdict, setAiVerdict]  = useState(null)
  const [aiLoading, setAiLoading]  = useState(false)

  const canRun = name1 && name2 && name1 !== name2

  const runCompare = async () => {
    if (!canRun) return
    setLoading(true); setError(null); setResult(null); setAiVerdict(null)

    try {
      const [p1, p2] = await Promise.all([fetchProfile(name1), fetchProfile(name2)])
      if (!p1) { setError(`Player not found: ${name1}`); setLoading(false); return }
      if (!p2) { setError(`Player not found: ${name2}`); setLoading(false); return }

      const [sim1, sim2] = await Promise.all([
        runSimulation(p1.impact_score, 38, p1.gp, p1.stats?.mp ?? 30),
        runSimulation(p2.impact_score, 38, p2.gp, p2.stats?.mp ?? 30),
      ])
      const [val1, val2] = await Promise.all([
        calculateValue(sim1.wins_added, salary1, p1.age ?? 0, p1.gp, p1.stats?.mp ?? 30),
        calculateValue(sim2.wins_added, salary2, p2.age ?? 0, p2.gp, p2.stats?.mp ?? 30),
      ])

      const newResult = { p1, p2, sim1, sim2, val1, val2 }
      setResult(newResult)

      setAiLoading(true)
      generateCompareVerdict(
        { name: p1.player, wins_added: sim1.wins_added, fair_value_m: val1.fair_value_m, salary_m: salary1, efficiency_ratio: val1.efficiency_ratio ?? 0, health_adj_m: val1.health_adjusted_value_m, decision: val1.decision },
        { name: p2.player, wins_added: sim2.wins_added, fair_value_m: val2.fair_value_m, salary_m: salary2, efficiency_ratio: val2.efficiency_ratio ?? 0, health_adj_m: val2.health_adjusted_value_m, decision: val2.decision }
      ).then(v => {
        console.log('raw verdict response:', JSON.stringify(v))  // ← сюда
        if (v?.verdict) setAiVerdict(v.verdict)
        else if (typeof v === 'string') setAiVerdict(v)
        setAiLoading(false)
      }).catch((err) => {
        console.log('verdict error:', err)
        setAiLoading(false)
      })

    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const winner = result
    ? (result.val1.health_adjusted_value_m >= result.val2.health_adjusted_value_m ? 1 : 2)
    : null

  return (
    <div style={{ minHeight: '100vh', paddingTop: '72px', paddingBottom: '64px' }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
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
            Player Comparison
          </h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-3)' }}>
            Head-to-head at any salary ask
          </p>
        </div>

        {/* ── Player inputs — key: overflow:visible on the grid ── */}
        <div className="fade-up-1" style={{ marginBottom: '1px' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px',
            background: 'var(--border)', borderRadius: 'var(--r-lg)',
            overflow: 'visible',   // ← CRITICAL: not 'hidden'
            marginBottom: '1px',
          }}>
            <PlayerSearch label="PLAYER 1" value={name1} onChange={setName1} players={players} salary={salary1} onSalary={setSalary1} />
            <PlayerSearch label="PLAYER 2" value={name2} onChange={setName2} players={players} salary={salary2} onSalary={setSalary2} />
          </div>

          <button onClick={runCompare} disabled={!canRun || loading} style={{
            width: '100%', padding: '11px 16px',
            background: canRun && !loading ? 'var(--text-0)' : 'var(--bg-3)',
            color: canRun && !loading ? 'var(--bg-0)' : 'var(--text-3)',
            border: 'none', borderRadius: 'var(--r-md)',
            fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500,
            cursor: canRun && !loading ? 'pointer' : 'not-allowed',
            letterSpacing: '-0.1px', transition: 'opacity 0.15s ease',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            marginTop: '8px',   // ← gap between inputs and button
          }}
            onMouseEnter={e => { if (canRun && !loading) e.currentTarget.style.opacity = '0.88' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
          >
            {loading ? (
              <>
                <span style={{ width: '12px', height: '12px', border: '1.5px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                Analyzing...
              </>
            ) : 'Compare Players →'}
          </button>

          {error && (
            <div style={{ marginTop: '8px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--red)', background: 'var(--red-subtle)', border: '1px solid var(--red-border)', borderRadius: 'var(--r-sm)', padding: '10px 14px' }}>
              {error}
            </div>
          )}
        </div>

        {/* Results */}
        {result && (
          <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '1px', marginTop: '1px' }}>

            {/* Winner panel */}
            <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '24px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-3)', letterSpacing: '0.5px', marginBottom: '8px' }}>Better Value</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: 600, letterSpacing: '-0.6px', color: 'var(--text-0)', marginBottom: '6px' }}>
                {winner === 1 ? result.p1.player : result.p2.player}
              </p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-3)' }}>
                Health-adjusted {fmtMoney(winner === 1 ? result.val1.health_adjusted_value_m : result.val2.health_adjusted_value_m)}
                {' · '}salary ask ${winner === 1 ? salary1 : salary2}M
              </p>
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-3)', letterSpacing: '0.3px', marginBottom: '10px' }}>
                  AI Analysis · Gemini 2.0 Flash
                </p>
                {aiLoading
                  ? <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-3)' }}>Generating analysis...</p>
                  : aiVerdict
                  ? <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-1)', lineHeight: 1.7, maxWidth: '520px', margin: '0 auto' }}>{aiVerdict}</p>
                  : null
                }
              </div>
            </div>

            {/* H2H table */}
            <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '20px 24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '8px', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600, color: 'var(--text-0)', textAlign: 'right' }}>{result.p1.player}</p>
                <div style={{ minWidth: '80px' }} />
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600, color: 'var(--text-0)', textAlign: 'left' }}>{result.p2.player}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '8px', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ textAlign: 'right' }}><VerdictBadge decision={result.val1.decision} /></div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-3)', textAlign: 'center', alignSelf: 'center', minWidth: '80px' }}>Decision</div>
                <div style={{ textAlign: 'left' }}><VerdictBadge decision={result.val2.decision} /></div>
              </div>

              <StatRow label="Fair Value"   v1={result.val1.fair_value_m}            v2={result.val2.fair_value_m}            format={fmtMoney} />
              <StatRow label="Salary Ask"   v1={salary1}                             v2={salary2}                             format={v => `$${v}M`} higherIsBetter={false} />
              <StatRow label="Efficiency"   v1={result.val1.efficiency_ratio}        v2={result.val2.efficiency_ratio}        format={v => `${v?.toFixed(2)}×`} />
              <StatRow label="Health-Adj."  v1={result.val1.health_adjusted_value_m} v2={result.val2.health_adjusted_value_m} format={fmtMoney} />
              <StatRow label="Wins Added"   v1={result.sim1.wins_added}              v2={result.sim2.wins_added}              format={v => `${v > 0 ? '+' : ''}${v.toFixed(1)}`} />
              <StatRow label="Impact"       v1={result.p1.impact_score}              v2={result.p2.impact_score}              format={v => v.toFixed(2)} />
              <StatRow label="Durability"   v1={result.val1.durability_score}        v2={result.val2.durability_score}        format={v => v.toFixed(2)} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '8px', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ textAlign: 'right' }}><RiskLabel value={result.val1.risk_label} /></div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-3)', textAlign: 'center', alignSelf: 'center', minWidth: '80px' }}>Risk</div>
                <div style={{ textAlign: 'left' }}><RiskLabel value={result.val2.risk_label} /></div>
              </div>

              <StatRow label="PTS" v1={result.p1.stats?.pts}    v2={result.p2.stats?.pts}    format={v => v.toFixed(1)} />
              <StatRow label="AST" v1={result.p1.stats?.ast}    v2={result.p2.stats?.ast}    format={v => v.toFixed(1)} />
              <StatRow label="REB" v1={result.p1.stats?.reb}    v2={result.p2.stats?.reb}    format={v => v.toFixed(1)} />
              <StatRow label="TS%" v1={result.p1.stats?.ts_pct} v2={result.p2.stats?.ts_pct} format={v => `${v.toFixed(1)}%`} />
              <StatRow label="GP"  v1={result.p1.gp}            v2={result.p2.gp}            format={v => `${v}/82`} />
            </div>

            {/* Per-player verdict cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
              {[
                { p: result.p1, val: result.val1, salary: salary1, isWinner: winner === 1 },
                { p: result.p2, val: result.val2, salary: salary2, isWinner: winner === 2 },
              ].map(({ p, val, salary, isWinner }) => (
                <div key={p.player} style={{ background: 'var(--bg-1)', padding: '20px 24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600, color: 'var(--text-0)' }}>{p.player}</p>
                    {isWinner && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--green)', border: '1px solid var(--green-border)', padding: '2px 8px', borderRadius: '999px' }}>
                        BETTER DEAL
                      </span>
                    )}
                  </div>
                  <div style={{ marginBottom: '12px' }}><VerdictBadge decision={val.decision} /></div>
                  {[
                    { label: 'Fair Value',  value: fmtMoney(val.fair_value_m),            color: val.fair_value_m < 0 ? 'var(--red)' : 'var(--text-0)' },
                    { label: 'Salary Ask',  value: `$${salary}M`,                         color: 'var(--text-0)' },
                    { label: 'Efficiency',  value: `${val.efficiency_ratio?.toFixed(2) ?? 'N/A'}×`, color: 'var(--text-0)' },
                    { label: 'Health-Adj.', value: fmtMoney(val.health_adjusted_value_m), color: val.health_adjusted_value_m < 0 ? 'var(--red)' : 'var(--text-0)' },
                    { label: 'Risk',        value: <RiskLabel value={val.risk_label} />,   color: null },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-3)' }}>{label}</span>
                      {color
                        ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600, color }}>{value}</span>
                        : value}
                    </div>
                  ))}
                </div>
              ))}
            </div>

          </div>
        )}
      </div>
      <style>{`
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
        input::placeholder { color: var(--text-3); }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}