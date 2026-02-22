const CFG = {
  SIGN: {
    label: '✓ SIGN',
    desc: 'Fair value meets or exceeds the salary ask.',
    gradient: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.04))',
    border: 'rgba(16,185,129,0.3)',
    glow: '0 0 40px rgba(16,185,129,0.08)',
    color: '#10B981',
  },
  NEGOTIATE: {
    label: '⟳ NEGOTIATE',
    desc: 'Moderate overpay risk. Push for a better number.',
    gradient: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(245,158,11,0.04))',
    border: 'rgba(245,158,11,0.3)',
    glow: '0 0 40px rgba(245,158,11,0.08)',
    color: '#F59E0B',
  },
  AVOID: {
    label: '✕ AVOID',
    desc: 'Significant overpay. Contract does not justify the ask.',
    gradient: 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.04))',
    border: 'rgba(239,68,68,0.25)',
    glow: '0 0 40px rgba(239,68,68,0.06)',
    color: '#EF4444',
  },
}

// FIX: корректный формат отрицательных значений
function fmtMoney(v) {
  if (v == null) return 'N/A'
  return v < 0 ? `-$${Math.abs(v).toFixed(1)}M` : `$${v.toFixed(1)}M`
}

export default function VerdictCard({ decision, efficiency_ratio, overpay_pct, fair_value_m, requested_salary_m }) {
  const cfg = CFG[decision] || CFG.NEGOTIATE

  // FIX: цвет efficiency учитывает отрицательные значения
  const effColor = efficiency_ratio == null
    ? '#F59E0B'
    : efficiency_ratio >= 1 ? '#10B981' : efficiency_ratio >= 0 ? '#F59E0B' : '#EF4444'

  return (
    <div className="rounded-2xl p-6 shadow-card"
      style={{ background: cfg.gradient, border: `1px solid ${cfg.border}`, boxShadow: cfg.glow }}
    >
      <p className="font-mono text-[10px] text-scout-muted uppercase tracking-[2px] mb-3">Executive Decision</p>
      <p className="font-mono text-5xl font-bold tracking-tight mb-5" style={{ color: cfg.color }}>
        {cfg.label}
      </p>
      <p className="text-scout-dim text-sm mb-4">{cfg.desc}</p>
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
        <div>
          <p className="font-mono text-[10px] text-scout-muted uppercase tracking-wider mb-1">Efficiency</p>
          <p className="font-mono text-xl font-bold" style={{ color: effColor }}>
            {efficiency_ratio != null ? `${efficiency_ratio.toFixed(2)}×` : 'N/A'}
          </p>
        </div>
        <div>
          <p className="font-mono text-[10px] text-scout-muted uppercase tracking-wider mb-1">Overpay</p>
          <p className="font-mono text-xl font-bold text-scout-text">
            {overpay_pct != null ? `${overpay_pct.toFixed(1)}%` : '—'}
          </p>
        </div>
        <div>
          <p className="font-mono text-[10px] text-scout-muted uppercase tracking-wider mb-1">Fair Value</p>
          {/* FIX: было $-8.6M, стало -$8.6M */}
          <p className={`font-mono text-xl font-bold ${fair_value_m < 0 ? 'text-scout-red' : 'text-scout-teal'}`}>
            {fmtMoney(fair_value_m)}
          </p>
        </div>
      </div>
    </div>
  )
}