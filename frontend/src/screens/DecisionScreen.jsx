import VerdictCard from '../components/VerdictCard'

function ValueBar({ label, value, max, color, textColor }) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div>
      <div className="flex justify-between font-mono text-xs mb-1.5">
        <span className="text-scout-muted uppercase tracking-wider">{label}</span>
        <span className={textColor}>${value.toFixed(1)}M</span>
      </div>
      <div className="h-1.5 bg-scout-border rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

export default function DecisionScreen({ data, onNext, onBack }) {
  const { profile, simulation, valuation, salaryAsk } = data
  if (!profile || !valuation) return null

  const { fair_value_m, efficiency_ratio, overpay_pct, decision } = valuation
  const wins_added = simulation?.wins_added ?? 0
  const maxBar = Math.max(fair_value_m, salaryAsk) * 1.2

  return (
    <main className="max-w-6xl mx-auto px-6 py-8 fade-up">

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-scout-text mb-1">Contract Decision</h2>
        <p className="font-mono text-sm text-scout-muted">
          {profile.player} · Salary ask: ${salaryAsk}M/yr · {wins_added.toFixed(1)} wins added
        </p>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="bg-scout-card border border-scout-border rounded-2xl p-5 shadow-card text-center">
          <p className="font-mono text-[10px] text-scout-muted uppercase tracking-[2px] mb-2">Fair Value</p>
          <p className="font-mono text-3xl font-bold text-scout-teal">${fair_value_m.toFixed(1)}M</p>
          <p className="font-mono text-[10px] text-scout-muted mt-1">{wins_added.toFixed(1)} wins × $3.8M</p>
        </div>
        <div className="bg-scout-card border border-scout-border rounded-2xl p-5 shadow-card text-center">
          <p className="font-mono text-[10px] text-scout-muted uppercase tracking-[2px] mb-2">Salary Ask</p>
          <p className="font-mono text-3xl font-bold text-scout-text">${salaryAsk}M</p>
          <p className="font-mono text-[10px] text-scout-muted mt-1">per year</p>
        </div>
        <div className="bg-scout-card border border-scout-border rounded-2xl p-5 shadow-card text-center">
          <p className="font-mono text-[10px] text-scout-muted uppercase tracking-[2px] mb-2">Efficiency</p>
          <p className={`font-mono text-3xl font-bold ${efficiency_ratio >= 1 ? 'text-scout-green' : efficiency_ratio >= 0.7 ? 'text-scout-amber' : 'text-scout-red'}`}>
            {efficiency_ratio.toFixed(2)}×
          </p>
          <p className="font-mono text-[10px] text-scout-muted mt-1">fair value / ask</p>
        </div>
      </div>

      {/* Value bars */}
      <div className="bg-scout-card border border-scout-border rounded-2xl p-5 mb-5 shadow-card space-y-4">
        <p className="font-mono text-[10px] text-scout-muted uppercase tracking-[2px]">Value Comparison</p>
        <ValueBar label="Fair Value"  value={fair_value_m} max={maxBar} color="#00C9E0" textColor="text-scout-teal" />
        <ValueBar label="Salary Ask"  value={salaryAsk}    max={maxBar} color="#F5A623" textColor="text-scout-gold" />
      </div>

      {/* Verdict */}
      <div className="mb-4">
        <VerdictCard
          decision={decision}
          efficiency_ratio={efficiency_ratio}
          overpay_pct={overpay_pct}
          fair_value_m={fair_value_m}
          requested_salary_m={salaryAsk}
        />
      </div>

      <p className="font-mono text-[10px] text-scout-muted text-center mb-2">
        Berri & Schmidt (2010) — 1 marginal win ≈ $3.8M team value
      </p>
      {decision === 'NEGOTIATE' && (
        <p className="font-mono text-xs text-scout-amber text-center mb-6">
          Suggested range: ${(fair_value_m * 0.95).toFixed(1)}M – ${(fair_value_m * 1.05).toFixed(1)}M
        </p>
      )}

      <div className="flex justify-between items-center mt-4">
        <button onClick={onBack}
          className="font-mono text-sm text-scout-muted hover:text-scout-text transition-colors">
          ← Back
        </button>
        <button onClick={onNext}
          className="px-6 py-2.5 rounded-xl font-mono font-bold text-sm tracking-wider transition-all active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #00C9E0, #0099B8)', color: '#050810', boxShadow: '0 0 16px rgba(0,201,224,0.2)' }}
        >
          AI Report →
        </button>
      </div>
    </main>
  )
}
