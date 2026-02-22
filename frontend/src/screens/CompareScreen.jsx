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
    <div className="bg-scout-card border border-scout-border rounded-2xl p-5 flex-1">
      <p className="font-mono text-[10px] text-scout-muted uppercase tracking-[2px] mb-3">{label}</p>

      <div ref={ref} className="relative mb-3">
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); onChange('') }}
          placeholder="Search player..."
          className="w-full bg-scout-card2 border border-scout-border rounded-xl px-4 py-3 font-mono text-sm text-scout-text placeholder-scout-muted focus:outline-none focus:border-scout-teal transition-colors"
        />
        {open && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-scout-card border border-scout-border rounded-xl overflow-hidden shadow-card">
            {filtered.map(name => (
              <button key={name} onClick={() => select(name)}
                className="w-full text-left px-4 py-2.5 font-mono text-sm text-scout-text hover:bg-scout-card2 transition-colors">
                {name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-scout-muted">Salary ask</span>
        <span className="font-mono text-xs text-scout-gold">$</span>
        <input
          type="number"
          value={salary}
          onChange={e => onSalary(Number(e.target.value))}
          min={1} max={200}
          className="w-20 bg-scout-card2 border border-scout-border rounded-lg px-2 py-1 font-mono text-sm text-scout-gold focus:outline-none focus:border-scout-teal"
        />
        <span className="font-mono text-xs text-scout-muted">M/yr</span>
      </div>
    </div>
  )
}

function StatRow({ label, v1, v2, format = v => v, compare = true, higherIsBetter = true }) {
  const n1 = typeof v1 === 'number' ? v1 : null
  const n2 = typeof v2 === 'number' ? v2 : null
  const p1Better = compare && n1 != null && n2 != null && (higherIsBetter ? n1 > n2 : n1 < n2)
  const p2Better = compare && n1 != null && n2 != null && (higherIsBetter ? n2 > n1 : n2 < n1)

  return (
    <div className="grid grid-cols-3 gap-2 py-2 border-b border-scout-border/30">
      <div className={`font-mono text-sm text-right ${p1Better ? 'text-scout-teal font-bold' : 'text-scout-text'}`}>
        {n1 != null ? format(n1) : (v1 != null ? format(v1) : '—')}
      </div>
      <div className="font-mono text-[10px] text-scout-muted uppercase tracking-wider text-center self-center">{label}</div>
      <div className={`font-mono text-sm text-left ${p2Better ? 'text-scout-teal font-bold' : 'text-scout-text'}`}>
        {n2 != null ? format(n2) : (v2 != null ? format(v2) : '—')}
      </div>
    </div>
  )
}

function DecisionBadge({ decision }) {
  const cfg = {
    SIGN:      { color: 'text-scout-green', border: 'border-scout-green/30', bg: 'bg-scout-green/5', label: '✓ SIGN' },
    NEGOTIATE: { color: 'text-scout-amber', border: 'border-scout-amber/30', bg: 'bg-scout-amber/5', label: '⟳ NEGOTIATE' },
    AVOID:     { color: 'text-scout-red',   border: 'border-scout-red/30',   bg: 'bg-scout-red/5',   label: '✕ AVOID' },
  }[decision] || { color: 'text-scout-muted', border: 'border-scout-border', bg: '', label: decision }

  return (
    <span className={`font-mono text-xs font-bold ${cfg.color} border ${cfg.border} ${cfg.bg} px-3 py-1 rounded-full`}>
      {cfg.label}
    </span>
  )
}

function RiskLabel({ value }) {
  const color = value === 'LOW RISK' ? 'text-scout-green' : value === 'MODERATE RISK' ? 'text-scout-amber' : 'text-scout-red'
  return <span className={`font-mono text-xs ${color}`}>{value}</span>
}

export default function CompareScreen({ onBack, players }) {
  const [name1, setName1]       = useState('')
  const [name2, setName2]       = useState('')
  const [salary1, setSalary1]   = useState(20)
  const [salary2, setSalary2]   = useState(20)
  const [result, setResult]     = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [aiVerdict, setAiVerdict]   = useState(null)
  const [aiLoading, setAiLoading]   = useState(false)

  const canRun = name1 && name2 && name1 !== name2

  const runCompare = async () => {
    if (!canRun) return
    setLoading(true)
    setError(null)
    setResult(null)
    setAiVerdict(null)

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

      // Fire AI verdict async — doesn't block the UI
      setAiLoading(true)
      generateCompareVerdict(
        {
          name: p1.player,
          wins_added: sim1.wins_added,
          fair_value_m: val1.fair_value_m,
          salary_m: salary1,
          efficiency_ratio: val1.efficiency_ratio ?? 0,
          health_adj_m: val1.health_adjusted_value_m,
          decision: val1.decision,
        },
        {
          name: p2.player,
          wins_added: sim2.wins_added,
          fair_value_m: val2.fair_value_m,
          salary_m: salary2,
          efficiency_ratio: val2.efficiency_ratio ?? 0,
          health_adj_m: val2.health_adjusted_value_m,
          decision: val2.decision,
        }
      ).then(v => {
        if (v?.verdict) setAiVerdict(v.verdict)
        else if (typeof v === 'string') setAiVerdict(v)
        setAiLoading(false)
      }).catch(() => setAiLoading(false))

    } catch (e) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const winner = result
    ? (result.val1.health_adjusted_value_m >= result.val2.health_adjusted_value_m ? 1 : 2)
    : null

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
              Player Comparison
            </span>
          </div>
          <h1 className="text-3xl font-bold text-scout-text">Player Comparison</h1>
          <p className="text-scout-muted font-mono text-sm mt-2">
            Compare two players head-to-head at any salary ask
          </p>
        </div>

        {/* Input card */}
        <div className="fade-up-1 bg-scout-card border border-scout-border rounded-2xl p-6 mb-6 shadow-card">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <PlayerSearch label="Player 1" value={name1} onChange={setName1} players={players} salary={salary1} onSalary={setSalary1} />
            <PlayerSearch label="Player 2" value={name2} onChange={setName2} players={players} salary={salary2} onSalary={setSalary2} />
          </div>

          <button
            onClick={runCompare}
            disabled={!canRun || loading}
            className="w-full py-3 rounded-xl font-mono text-sm font-bold uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: canRun && !loading ? 'linear-gradient(135deg, #00C9E0, #0099B8)' : undefined,
              backgroundColor: !canRun || loading ? '#1c2333' : undefined,
              color: canRun && !loading ? '#050810' : '#4B5C6B',
              boxShadow: canRun && !loading ? '0 0 20px rgba(0,201,224,0.25)' : 'none',
            }}
          >
            {loading ? 'Analyzing...' : 'Compare Players →'}
          </button>

          {error && (
            <div className="mt-4 font-mono text-xs text-scout-red bg-scout-red/10 border border-scout-red/20 rounded-lg px-4 py-3">
              {error}
            </div>
          )}
        </div>

        {/* Results */}
        {result && (
          <div className="fade-up space-y-5">

            {/* Winner banner */}
            <div className="bg-scout-teal/5 border border-scout-teal/30 rounded-2xl p-5 text-center">
              <p className="font-mono text-[10px] text-scout-muted uppercase tracking-[2px] mb-1">Better Value</p>
              <p className="font-mono text-2xl font-bold text-scout-teal">
                {winner === 1 ? result.p1.player : result.p2.player}
              </p>
              <p className="font-mono text-xs text-scout-muted mt-1">
                Health-adjusted value: {fmtMoney(winner === 1 ? result.val1.health_adjusted_value_m : result.val2.health_adjusted_value_m)}
                {' · '}salary ask: ${winner === 1 ? salary1 : salary2}M
              </p>

              {/* AI Verdict */}
              <div className="mt-4 pt-4 border-t border-scout-teal/20">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="font-mono text-[9px] text-scout-teal/60 uppercase tracking-widest">AI Analysis</span>
                  <span className="font-mono text-[9px] text-scout-muted uppercase tracking-widest">· Powered by Gemini</span>
                </div>
                {aiLoading ? (
                  <p className="font-mono text-xs text-scout-muted animate-pulse">Generating analysis...</p>
                ) : aiVerdict ? (
                  <p className="font-mono text-sm text-scout-text leading-relaxed max-w-lg mx-auto">
                    {aiVerdict}
                  </p>
                ) : null}
              </div>
            </div>

            {/* Head to head table */}
            <div className="bg-scout-card border border-scout-border rounded-2xl p-5 shadow-card">
              <div className="grid grid-cols-3 gap-2 mb-4 pb-3 border-b border-scout-border/40">
                <p className="font-mono text-sm font-bold text-scout-teal text-right truncate">{result.p1.player}</p>
                <p className="font-mono text-[10px] text-scout-muted uppercase tracking-wider text-center self-center">Metric</p>
                <p className="font-mono text-sm font-bold text-scout-gold text-left truncate">{result.p2.player}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 py-2 border-b border-scout-border/30">
                <div className="text-right"><DecisionBadge decision={result.val1.decision} /></div>
                <div className="font-mono text-[10px] text-scout-muted uppercase tracking-wider text-center self-center">Decision</div>
                <div className="text-left"><DecisionBadge decision={result.val2.decision} /></div>
              </div>

              <StatRow label="Fair Value"   v1={result.val1.fair_value_m}            v2={result.val2.fair_value_m}            format={fmtMoney} />
              <StatRow label="Salary Ask"   v1={salary1}                             v2={salary2}                             format={v => `$${v}M`} higherIsBetter={false} />
              <StatRow label="Efficiency"   v1={result.val1.efficiency_ratio}        v2={result.val2.efficiency_ratio}        format={v => `${v?.toFixed(2)}x`} />
              <StatRow label="Health-Adj."  v1={result.val1.health_adjusted_value_m} v2={result.val2.health_adjusted_value_m} format={fmtMoney} />
              <StatRow label="Wins Added"   v1={result.sim1.wins_added}              v2={result.sim2.wins_added}              format={v => `${v > 0 ? '+' : ''}${v.toFixed(1)}`} />
              <StatRow label="Impact Score" v1={result.p1.impact_score}              v2={result.p2.impact_score}              format={v => v.toFixed(2)} />
              <StatRow label="Durability"   v1={result.val1.durability_score}        v2={result.val2.durability_score}        format={v => v.toFixed(2)} />

              <div className="grid grid-cols-3 gap-2 py-2 border-b border-scout-border/30">
                <div className="text-right"><RiskLabel value={result.val1.risk_label} /></div>
                <div className="font-mono text-[10px] text-scout-muted uppercase tracking-wider text-center self-center">Risk</div>
                <div className="text-left"><RiskLabel value={result.val2.risk_label} /></div>
              </div>

              <StatRow label="PTS" v1={result.p1.stats?.pts}    v2={result.p2.stats?.pts}    format={v => v.toFixed(1)} />
              <StatRow label="AST" v1={result.p1.stats?.ast}    v2={result.p2.stats?.ast}    format={v => v.toFixed(1)} />
              <StatRow label="REB" v1={result.p1.stats?.reb}    v2={result.p2.stats?.reb}    format={v => v.toFixed(1)} />
              <StatRow label="TS%" v1={result.p1.stats?.ts_pct} v2={result.p2.stats?.ts_pct} format={v => `${v.toFixed(1)}%`} />
              <StatRow label="GP"  v1={result.p1.gp}            v2={result.p2.gp}            format={v => `${v}/82`} />
            </div>

            {/* Verdict cards */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { p: result.p1, val: result.val1, salary: salary1, isWinner: winner === 1 },
                { p: result.p2, val: result.val2, salary: salary2, isWinner: winner === 2 },
              ].map(({ p, val, salary, isWinner }, i) => (
                <div key={i} className={`bg-scout-card rounded-2xl p-5 border shadow-card ${isWinner ? 'border-scout-teal/40' : 'border-scout-border'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-mono text-sm font-bold text-scout-text truncate">{p.player}</p>
                    {isWinner && (
                      <span className="font-mono text-[9px] text-scout-teal border border-scout-teal/30 px-2 py-0.5 rounded-full">
                        BETTER DEAL
                      </span>
                    )}
                  </div>
                  <DecisionBadge decision={val.decision} />
                  <div className="mt-3 space-y-1.5">
                    <div className="flex justify-between font-mono text-[10px]">
                      <span className="text-scout-muted">Fair Value</span>
                      <span className={val.fair_value_m < 0 ? 'text-scout-red' : 'text-scout-teal'}>{fmtMoney(val.fair_value_m)}</span>
                    </div>
                    <div className="flex justify-between font-mono text-[10px]">
                      <span className="text-scout-muted">Salary Ask</span>
                      <span className="text-scout-gold">${salary}M</span>
                    </div>
                    <div className="flex justify-between font-mono text-[10px]">
                      <span className="text-scout-muted">Efficiency</span>
                      <span className="text-scout-text">{val.efficiency_ratio?.toFixed(2) ?? 'N/A'}x</span>
                    </div>
                    <div className="flex justify-between font-mono text-[10px]">
                      <span className="text-scout-muted">Health-Adj.</span>
                      <span className={val.health_adjusted_value_m < 0 ? 'text-scout-red' : 'text-scout-text'}>{fmtMoney(val.health_adjusted_value_m)}</span>
                    </div>
                    <div className="flex justify-between font-mono text-[10px]">
                      <span className="text-scout-muted">Risk</span>
                      <RiskLabel value={val.risk_label} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>
    </div>
  )
}