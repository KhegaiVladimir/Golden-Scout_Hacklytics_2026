import VerdictCard from '../components/VerdictCard'

// FIX: корректное отображение отрицательных денежных значений
function fmtMoney(v) {
  if (v == null) return 'N/A'
  return v < 0 ? `-$${Math.abs(v).toFixed(1)}M` : `$${v.toFixed(1)}M`
}

function ValueBar({ label, value, max, color, textColor }) {
  // FIX: защита от отрицательных значений и нулевого max
  const safeMax = Math.max(Math.abs(max), 1)
  const pct = Math.max(0, Math.min(100, (Math.abs(value) / safeMax) * 100))
  const isNegative = value < 0

  return (
    <div>
      <div className="flex justify-between font-mono text-xs mb-1.5">
        <span className="text-scout-muted uppercase tracking-wider">{label}</span>
        <span className={isNegative ? 'text-scout-red' : textColor}>{fmtMoney(value)}</span>
      </div>
      <div className="h-1.5 bg-scout-border rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: isNegative ? '#EF4444' : color }} />
      </div>
    </div>
  )
}

function getRiskStyle(riskLabel) {
  switch (riskLabel) {
    case 'LOW RISK':
      return { color: 'text-scout-green', bg: 'bg-scout-green/5 border-scout-green/20', barColor: '#10B981' }
    case 'MODERATE RISK':
      return { color: 'text-scout-amber', bg: 'bg-scout-amber/5 border-scout-amber/20', barColor: '#F59E0B' }
    case 'INJURY SEASON':
      return { color: 'text-scout-amber', bg: 'bg-scout-amber/5 border-scout-amber/20', barColor: '#F59E0B' }
    case 'HIGH RISK':
      return { color: 'text-scout-red', bg: 'bg-scout-red/5 border-scout-red/20', barColor: '#EF4444' }
    case 'VERY HIGH RISK':
      return { color: 'text-scout-red', bg: 'bg-scout-red/5 border-scout-red/20', barColor: '#EF4444' }
    default:
      return { color: 'text-scout-red', bg: 'bg-scout-red/5 border-scout-red/20', barColor: '#EF4444' }
  }
}

function InjuryRiskCard({ profile, valuation }) {
  const { durability_score, durability_discount_pct, health_adjusted_value_m, fair_value_m, risk_label } = valuation
  const age = profile?.age && profile.age !== 'N/A' ? profile.age : '?'
  const gp  = profile?.gp ?? 0

  const label = risk_label ?? 'HIGH RISK'
  const { color, bg, barColor } = getRiskStyle(label)

  // FIX: защита от деления на 0 в баре
  const barPct = fair_value_m !== 0
    ? Math.max(0, Math.min(100, (health_adjusted_value_m / fair_value_m) * 100))
    : 0

  const rawEfficiency = valuation.requested_salary_m > 0
    ? (fair_value_m / valuation.requested_salary_m).toFixed(2)
    : 'N/A'

  return (
    <div className={`bg-scout-card border ${bg} rounded-2xl p-5 mb-5 shadow-card`}>
      <div className="flex items-center justify-between mb-4">
        <p className="font-mono text-[10px] text-scout-muted uppercase tracking-[2px]">
          Injury Risk Adjustment
        </p>
        <span className={`font-mono text-[10px] font-bold ${color} border ${bg} px-2 py-0.5 rounded-full`}>
          {label}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="font-mono text-[10px] text-scout-muted uppercase tracking-[2px] mb-1">Raw Fair Value</p>
          <p className={`font-mono text-xl font-bold ${fair_value_m < 0 ? 'text-scout-red' : 'text-scout-teal'}`}>
            {fmtMoney(fair_value_m)}
          </p>
          <p className="font-mono text-[9px] text-scout-muted mt-0.5">if healthy all season</p>
        </div>
        <div className="text-center">
          <p className="font-mono text-[10px] text-scout-muted uppercase tracking-[2px] mb-1">Durability Score</p>
          <p className={`font-mono text-xl font-bold ${color}`}>{durability_score.toFixed(2)}</p>
          <p className="font-mono text-[9px] text-scout-muted mt-0.5">
            age {age} · {gp}/82 games
          </p>
        </div>
        <div className="text-center">
          <p className="font-mono text-[10px] text-scout-muted uppercase tracking-[2px] mb-1">Health-Adj. Value</p>
          <p className={`font-mono text-xl font-bold ${health_adjusted_value_m < 0 ? 'text-scout-red' : color}`}>
            {fmtMoney(health_adjusted_value_m)}
          </p>
          <p className="font-mono text-[9px] text-scout-muted mt-0.5">-{durability_discount_pct}% discount</p>
        </div>
      </div>

      {/* Visual bar */}
      <div className="mt-4">
        <div className="flex justify-between font-mono text-[9px] text-scout-muted mb-1">
          <span>Health-Adjusted</span>
          <span>Raw Fair Value</span>
        </div>
        <div className="h-1.5 bg-scout-border rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${barPct}%`, background: barColor }}
          />
        </div>
      </div>

      {/* Explanation */}
      <div className="mt-4 pt-4 border-t border-white/5">
        <p className="font-mono text-[10px] text-scout-muted leading-relaxed">
          <span className="text-scout-text">How it works:</span>{' '}
          Efficiency {rawEfficiency}x is calculated using{' '}
          <span className={fair_value_m < 0 ? 'text-scout-red' : 'text-scout-teal'}>
            raw fair value {fmtMoney(fair_value_m)}
          </span> —
          what the player is worth if healthy all season.
          The verdict is based on{' '}
          <span className={health_adjusted_value_m < 0 ? 'text-scout-red' : color}>
            health-adjusted value {fmtMoney(health_adjusted_value_m)}
          </span> —
          real value accounting for the risk of missed games
          (age {age} · {gp}/82 games · {durability_discount_pct}% discount).
        </p>
      </div>
    </div>
  )
}

export default function DecisionScreen({ data, onNext, onBack }) {
  const { profile, simulation, valuation, salaryAsk } = data
  if (!profile || !valuation) return null

  const {
    fair_value_m, efficiency_ratio, overpay_pct, decision,
    health_adjusted_value_m, risk_label, is_projected, projected_wins, absence_reason
  } = valuation

  const wins_added = simulation?.wins_added ?? 0
  const gp = profile?.gp ?? 82
  const mpg = (profile?.stats?.mp ?? profile?.mpg)?.toFixed(1) ?? '?'
  // FIX: maxBar корректно работает с отрицательными fair_value
  const maxBar = Math.max(Math.abs(fair_value_m), salaryAsk, 1) * 1.2

  const hasRisk = valuation.durability_discount_pct > 10
  const efficiencyNote = hasRisk
    ? `based on raw value · health-adj. ${health_adjusted_value_m != null && salaryAsk > 0 ? (health_adjusted_value_m / salaryAsk).toFixed(2) : 'N/A'}x`
    : 'fair value / ask'

  // FIX: цвет efficiency с учётом отрицательных значений
  const efficiencyColor = efficiency_ratio == null
    ? 'text-scout-muted'
    : efficiency_ratio >= 1
      ? 'text-scout-green'
      : efficiency_ratio >= 0.7
        ? 'text-scout-amber'
        : 'text-scout-red'

  return (
    <main className="max-w-6xl mx-auto px-6 py-8 fade-up">

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-scout-text mb-1">Contract Decision</h2>
        <p className="font-mono text-sm text-scout-muted">
          {profile.player} · Salary ask: ${salaryAsk}M/yr · {wins_added.toFixed(1)} wins added
          {is_projected && <span className="ml-2 text-scout-amber">· {gp} GP — projected to 82</span>}
          {absence_reason === 'injury' && <span className="ml-2 text-scout-red">· {gp} GP — injury season</span>}
        </p>
      </div>

      {/* Partial season banner */}
      {is_projected && absence_reason === 'partial' && (
        <div className="bg-scout-amber/5 border border-scout-amber/20 rounded-xl px-4 py-3 mb-5 flex items-start gap-3">
          <span className="font-mono text-scout-amber text-sm mt-0.5">⚠</span>
          <p className="font-mono text-[11px] text-scout-muted leading-relaxed">
            <span className="text-scout-amber font-bold">Partial season data ({gp}/82 games).</span>{' '}
            Stats extrapolated to a full 82-game season using a{' '}
            <span className="text-scout-text">×{(82 / gp).toFixed(2)} projection multiplier</span>.
            Fair value reflects projected full-season performance.
          </p>
        </div>
      )}

      {/* Injury season banner */}
      {absence_reason === 'injury' && (
        <div className="bg-scout-red/5 border border-scout-red/20 rounded-xl px-4 py-3 mb-5 flex items-start gap-3">
          <span className="font-mono text-scout-red text-sm mt-0.5">✕</span>
          <p className="font-mono text-[11px] text-scout-muted leading-relaxed">
            <span className="text-scout-red font-bold">Injury-affected season ({gp}/82 games).</span>{' '}
            High minutes ({mpg} MPG) with low games played indicates missed time due to injury —
            stats are <span className="text-scout-text">not extrapolated</span>.
            Fair value reflects actual output only. Injury risk is already captured in the durability discount below.
          </p>
        </div>
      )}

      {/* Top metrics */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="bg-scout-card border border-scout-border rounded-2xl p-5 shadow-card text-center">
          <p className="font-mono text-[10px] text-scout-muted uppercase tracking-[2px] mb-2">Fair Value</p>
          <p className={`font-mono text-3xl font-bold ${fair_value_m < 0 ? 'text-scout-red' : 'text-scout-teal'}`}>
            {fmtMoney(fair_value_m)}
          </p>
          <p className="font-mono text-[10px] text-scout-muted mt-1">
            {projected_wins?.toFixed(1) ?? wins_added.toFixed(1)} wins × $3.8M
            {is_projected && <span className="text-scout-amber"> (proj.)</span>}
          </p>
        </div>
        <div className="bg-scout-card border border-scout-border rounded-2xl p-5 shadow-card text-center">
          <p className="font-mono text-[10px] text-scout-muted uppercase tracking-[2px] mb-2">Salary Ask</p>
          <p className="font-mono text-3xl font-bold text-scout-text">${salaryAsk}M</p>
          <p className="font-mono text-[10px] text-scout-muted mt-1">per year</p>
        </div>
        <div className="bg-scout-card border border-scout-border rounded-2xl p-5 shadow-card text-center">
          <p className="font-mono text-[10px] text-scout-muted uppercase tracking-[2px] mb-2">Efficiency</p>
          <p className={`font-mono text-3xl font-bold ${efficiencyColor}`}>
            {efficiency_ratio != null ? `${efficiency_ratio.toFixed(2)}x` : 'N/A'}
          </p>
          <p className="font-mono text-[9px] text-scout-muted mt-1">{efficiencyNote}</p>
        </div>
      </div>

      {/* Value bars */}
      <div className="bg-scout-card border border-scout-border rounded-2xl p-5 mb-5 shadow-card space-y-4">
        <p className="font-mono text-[10px] text-scout-muted uppercase tracking-[2px]">Value Comparison</p>
        <ValueBar
          label={`Fair Value${is_projected ? ' (proj.)' : ''}`}
          value={fair_value_m} max={maxBar} color="#00C9E0" textColor="text-scout-teal"
        />
        <ValueBar label="Salary Ask" value={salaryAsk} max={maxBar} color="#F5A623" textColor="text-scout-gold" />
      </div>

      {/* Injury Risk */}
      {valuation.durability_score != null && (
        <InjuryRiskCard profile={profile} valuation={{ ...valuation, requested_salary_m: salaryAsk }} />
      )}

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
        Berri & Schmidt (2010) — 1 marginal win ~ $3.8M · Durability model: GP/82 × age curve
        {is_projected && ` · Stats projected from ${gp} GP`}
        {absence_reason === 'injury' && ` · Injury season — ${gp} GP not extrapolated`}
      </p>

      {decision === 'NEGOTIATE' && (
        <p className="font-mono text-xs text-scout-amber text-center mb-6">
          Suggested range: {fmtMoney(fair_value_m * 0.95)} – {fmtMoney(fair_value_m * 1.05)}
        </p>
      )}

      <div className="flex justify-between items-center mt-4">
        <button onClick={onBack}
          className="font-mono text-sm text-scout-muted hover:text-scout-text transition-colors">
          Back
        </button>
        <button onClick={onNext}
          className="px-6 py-2.5 rounded-xl font-mono font-bold text-sm tracking-wider transition-all active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #00C9E0, #0099B8)', color: '#050810', boxShadow: '0 0 16px rgba(0,201,224,0.2)' }}
        >
          AI Report
        </button>
      </div>
    </main>
  )
}