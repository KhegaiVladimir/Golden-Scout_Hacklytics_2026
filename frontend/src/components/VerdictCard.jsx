const CONFIG = {
  SIGN:      { label: '✓ SIGN',      cls: 'bg-green-900/40 border-green-500 text-green-400' },
  NEGOTIATE: { label: '⟳ NEGOTIATE', cls: 'bg-amber-900/40 border-amber-500  text-amber-400'  },
  AVOID:     { label: '✕ AVOID',     cls: 'bg-red-900/40   border-red-500    text-red-400'    },
}

function fmt(n) {
  return n != null ? `$${Number(n).toFixed(1)}M` : '—'
}

export default function VerdictCard({ decision, efficiency_ratio, overpay_pct, fair_value_m, requested_salary_m }) {
  const cfg = CONFIG[decision] || CONFIG.NEGOTIATE
  return (
    <div className={`rounded-xl border-2 p-6 text-center ${cfg.cls}`}>
      <p className="font-mono text-5xl font-bold tracking-tight mb-4">{cfg.label}</p>
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/10">
        <div>
          <p className="text-xs text-scout-muted uppercase tracking-wider mb-1">Efficiency</p>
          <p className={`font-mono text-xl font-bold ${efficiency_ratio >= 1 ? 'text-green-400' : 'text-scout-amber'}`}>
            {efficiency_ratio?.toFixed(2)}×
          </p>
        </div>
        <div>
          <p className="text-xs text-scout-muted uppercase tracking-wider mb-1">Overpay</p>
          <p className="font-mono text-xl font-bold text-scout-text">{overpay_pct?.toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-xs text-scout-muted uppercase tracking-wider mb-1">Fair Value</p>
          <p className="font-mono text-xl font-bold text-scout-teal">{fmt(fair_value_m)}</p>
        </div>
      </div>
    </div>
  )
}