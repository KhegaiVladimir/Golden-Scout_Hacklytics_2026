import VerdictCard from '../components/VerdictCard'

export default function DecisionScreen({ data, onNext, onBack }) {
  const { profile, simulation, valuation, salaryAsk } = data
  if (!profile || !valuation) return null

  const { fair_value_m, efficiency_ratio, overpay_pct, decision } = valuation
  const wins_added = simulation?.wins_added ?? 0

  return (
    <main className="max-w-5xl mx-auto px-6 py-8 fade-up">

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-scout-text">Contract Decision</h2>
        <p className="font-mono text-sm text-scout-muted mt-1">{profile.player} · Salary ask: ${salaryAsk}M/yr</p>
      </div>

      {/* Top 3 numbers */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-scout-card rounded-xl border border-scout-border p-5 text-center">
          <p className="font-mono text-[10px] text-scout-muted uppercase tracking-widest mb-2">Fair Value</p>
          <p className="font-mono text-3xl font-bold text-scout-teal">
            {fair_value_m > 0 ? `$${fair_value_m.toFixed(1)}M` : '$0.0M'}
          </p>
        </div>
        <div className="bg-scout-card rounded-xl border border-scout-border p-5 text-center">
          <p className="font-mono text-[10px] text-scout-muted uppercase tracking-widest mb-2">Salary Ask</p>
          <p className="font-mono text-3xl font-bold text-scout-text">${salaryAsk}M</p>
        </div>
        <div className="bg-scout-card rounded-xl border border-scout-border p-5 text-center">
          <p className="font-mono text-[10px] text-scout-muted uppercase tracking-widest mb-2">Efficiency</p>
          <p className={`font-mono text-3xl font-bold ${efficiency_ratio != null && efficiency_ratio >= 1 ? 'text-green-400' : 'text-scout-amber'}`}>
            {efficiency_ratio != null ? `${efficiency_ratio.toFixed(2)}×` : 'N/A'}
          </p>
        </div>
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

      {/* Context note */}
      <p className="font-mono text-xs text-scout-muted text-center mb-2">
        Fair market value based on {wins_added.toFixed(1)} wins × $3.8M/win (Berri & Schmidt, 2010)
      </p>
      {decision === 'NEGOTIATE' && (
        <p className="font-mono text-xs text-scout-amber text-center">
          Suggested range: ${(fair_value_m * 0.95).toFixed(1)}M – ${(fair_value_m * 1.05).toFixed(1)}M
        </p>
      )}

      <div className="flex justify-between mt-8">
        <button onClick={onBack}
          className="font-mono text-sm text-scout-muted hover:text-scout-text transition-colors">
          ← Back
        </button>
        <button onClick={onNext}
          className="px-6 py-2.5 bg-scout-teal text-scout-bg font-mono font-bold text-sm tracking-wider rounded-lg hover:bg-scout-teal/90 transition-all">
          Next: AI Report →
        </button>
      </div>
    </main>
  )
}