import VerdictCard from '../components/VerdictCard'

function fmtMoney(v) {
  if (v == null) return 'N/A'
  return v < 0 ? `-$${Math.abs(v).toFixed(1)}M` : `$${v.toFixed(1)}M`
}

function ValueBar({ label, value, max, positive }) {
  const safeMax = Math.max(Math.abs(max), 1)
  const pct     = Math.max(0, Math.min(100, (Math.abs(value) / safeMax) * 100))
  const isNeg   = value < 0
  const color   = isNeg ? 'var(--red)' : positive ? 'var(--green)' : 'var(--text-2)'

  return (
    <div>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontFamily: 'var(--font-mono)', fontSize: '11px',
        marginBottom: '6px',
      }}>
        <span style={{ color: 'var(--text-3)', letterSpacing: '0.3px' }}>{label}</span>
        <span style={{ color, fontWeight: 600 }}>{fmtMoney(value)}</span>
      </div>
      <div style={{
        height: '4px', background: 'var(--bg-3)',
        borderRadius: '999px', overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: color, borderRadius: '999px',
          transition: 'width 1.2s cubic-bezier(0.16,1,0.3,1)',
        }} />
      </div>
    </div>
  )
}

function getRiskTokens(label) {
  switch (label) {
    case 'LOW RISK':     return { color: 'var(--green)', subtle: 'var(--green-subtle)', border: 'var(--green-border)' }
    case 'MODERATE RISK':
    case 'INJURY SEASON': return { color: 'var(--amber)', subtle: 'var(--amber-subtle)', border: 'var(--amber-border)' }
    case 'HIGH RISK':
    case 'VERY HIGH RISK':
    default:             return { color: 'var(--red)',   subtle: 'var(--red-subtle)',   border: 'var(--red-border)'   }
  }
}

function Banner({ type, children }) {
  const color  = type === 'warning' ? 'var(--amber)' : 'var(--red)'
  const subtle = type === 'warning' ? 'var(--amber-subtle)' : 'var(--red-subtle)'
  const border = type === 'warning' ? 'var(--amber-border)' : 'var(--red-border)'
  const icon   = type === 'warning' ? '⚠' : '✕'
  return (
    <div style={{
      background: subtle, border: `1px solid ${border}`,
      borderRadius: 'var(--r-md)', padding: '12px 16px',
      display: 'flex', gap: '10px', alignItems: 'flex-start',
      marginBottom: '1px',
    }}>
      <span style={{ fontFamily: 'var(--font-mono)', color, fontSize: '12px', marginTop: '1px', flexShrink: 0 }}>
        {icon}
      </span>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-2)', lineHeight: 1.65 }}>
        {children}
      </p>
    </div>
  )
}

function InjuryRiskCard({ profile, valuation }) {
  const {
    durability_score, durability_discount_pct,
    health_adjusted_value_m, fair_value_m,
    risk_label, requested_salary_m,
  } = valuation

  const age    = profile?.age && profile.age !== 'N/A' ? profile.age : '?'
  const gp     = profile?.gp ?? 0
  const label  = risk_label ?? 'HIGH RISK'
  const tokens = getRiskTokens(label)

  const barPct = fair_value_m !== 0
    ? Math.max(0, Math.min(100, (health_adjusted_value_m / Math.abs(fair_value_m)) * 100))
    : 0

  const rawEfficiency = requested_salary_m > 0
    ? (fair_value_m / requested_salary_m).toFixed(2)
    : 'N/A'

  const triValues = [
    { label: 'Raw Fair Value',    val: fair_value_m,            note: 'if healthy all season',        color: fair_value_m < 0 ? 'var(--red)' : 'var(--text-0)' },
    { label: 'Durability Score',  val: durability_score.toFixed(2), note: `age ${age} · ${gp}/82 games`, color: tokens.color, raw: true },
    { label: 'Health-Adj. Value', val: health_adjusted_value_m, note: `-${durability_discount_pct}% discount`, color: health_adjusted_value_m < 0 ? 'var(--red)' : tokens.color },
  ]

  return (
    <div style={{
      background: 'var(--bg-1)',
      border: `1px solid ${tokens.border}`,
      borderRadius: 'var(--r-lg)',
      padding: '24px',
      marginBottom: '1px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-3)', letterSpacing: '0.3px' }}>
          Injury risk adjustment
        </p>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 600,
          color: tokens.color, background: tokens.subtle,
          border: `1px solid ${tokens.border}`,
          padding: '2px 10px', borderRadius: '999px', letterSpacing: '0.3px',
        }}>
          {label}
        </span>
      </div>

      {/* Three values */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1px', background: 'var(--border)',
        borderRadius: 'var(--r-md)', overflow: 'hidden',
        marginBottom: '16px',
      }}>
        {triValues.map(({ label, val, note, color, raw }) => (
          <div key={label} style={{ background: 'var(--bg-0)', padding: '16px' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-3)', letterSpacing: '0.3px', marginBottom: '8px' }}>
              {label}
            </p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: 600, color, letterSpacing: '-0.4px', marginBottom: '4px' }}>
              {raw ? val : fmtMoney(val)}
            </p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-3)' }}>{note}</p>
          </div>
        ))}
      </div>

      {/* Visual bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-3)', marginBottom: '6px' }}>
          <span>Health-adjusted</span>
          <span>Raw fair value</span>
        </div>
        <div style={{ height: '4px', background: 'var(--bg-3)', borderRadius: '999px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${barPct}%`, background: tokens.color, borderRadius: '999px', transition: 'width 1.2s cubic-bezier(0.16,1,0.3,1)' }} />
        </div>
      </div>

      {/* Explanation */}
      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-2)', lineHeight: 1.7 }}>
          <span style={{ color: 'var(--text-0)' }}>How it works:</span>{' '}
          Efficiency {rawEfficiency}× uses raw fair value{' '}
          <span style={{ color: fair_value_m < 0 ? 'var(--red)' : 'var(--text-0)' }}>{fmtMoney(fair_value_m)}</span>.
          {' '}The verdict uses health-adjusted value{' '}
          <span style={{ color: tokens.color }}>{fmtMoney(health_adjusted_value_m)}</span>{' '}
          — accounting for age {age}, {gp}/82 games, and a {durability_discount_pct}% durability discount.
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
    health_adjusted_value_m, is_projected, projected_wins, absence_reason,
  } = valuation

  const wins_added = simulation?.wins_added ?? 0
  const gp         = profile?.gp ?? 82
  const mpg        = (profile?.stats?.mp ?? profile?.mpg)?.toFixed(1) ?? '?'
  const maxBar     = Math.max(Math.abs(fair_value_m), salaryAsk, 1) * 1.2

  const efficiencyColor = efficiency_ratio == null ? 'var(--text-3)'
    : efficiency_ratio >= 1   ? 'var(--green)'
    : efficiency_ratio >= 0.7 ? 'var(--amber)'
    :                           'var(--red)'

  const efficiencyNote = valuation.durability_discount_pct > 10
    ? `raw value · health-adj. ${health_adjusted_value_m != null && salaryAsk > 0 ? (health_adjusted_value_m / salaryAsk).toFixed(2) : 'N/A'}×`
    : 'fair value / salary ask'

  const topPanels = [
    {
      label: is_projected ? 'Fair Value (proj.)' : 'Fair Value',
      value: fmtMoney(fair_value_m),
      sub:   `${(projected_wins ?? wins_added).toFixed(1)} wins × $3.8M${is_projected ? ' (proj.)' : ''}`,
      color: fair_value_m < 0 ? 'var(--red)' : 'var(--text-0)',
    },
    {
      label: 'Salary Ask',
      value: `$${salaryAsk}M`,
      sub:   'per year',
      color: 'var(--text-0)',
    },
    {
      label: 'Efficiency',
      value: efficiency_ratio != null ? `${efficiency_ratio.toFixed(2)}×` : 'N/A',
      sub:   efficiencyNote,
      color: efficiencyColor,
    },
  ]

  return (
    <main style={{ maxWidth: '1080px', margin: '0 auto', padding: '40px 24px 48px' }}
      className="fade-up">

      {/* ── Header ───────────────────────────────── */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 600, letterSpacing: '-0.6px', color: 'var(--text-0)', marginBottom: '6px' }}>
          Contract Decision
        </h2>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-3)', letterSpacing: '0.2px' }}>
          {profile.player} · Salary ask ${salaryAsk}M/yr · {wins_added.toFixed(1)} wins added
          {is_projected && <span style={{ color: 'var(--amber)', marginLeft: '8px' }}>· {gp} GP — projected to 82</span>}
          {absence_reason === 'injury' && <span style={{ color: 'var(--red)', marginLeft: '8px' }}>· {gp} GP — injury season</span>}
        </p>
      </div>

      {/* ── Banners ──────────────────────────────── */}
      {is_projected && absence_reason === 'partial' && (
        <Banner type="warning">
          <span style={{ color: 'var(--amber)', fontWeight: 600 }}>Partial season data ({gp}/82 games).</span>{' '}
          Stats extrapolated to 82 games using a{' '}
          <span style={{ color: 'var(--text-0)' }}>×{(82 / gp).toFixed(2)} projection multiplier</span>.
          Fair value reflects projected full-season performance.
        </Banner>
      )}
      {absence_reason === 'injury' && (
        <Banner type="danger">
          <span style={{ color: 'var(--red)', fontWeight: 600 }}>Injury-affected season ({gp}/82 games).</span>{' '}
          High minutes ({mpg} MPG) with low games suggests missed time —{' '}
          <span style={{ color: 'var(--text-0)' }}>stats are not extrapolated</span>.
          Injury risk is captured in the durability discount below.
        </Banner>
      )}

      {/* ── Top panels (gap-as-border) ───────────── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1px', background: 'var(--border)',
        borderRadius: 'var(--r-lg)', overflow: 'hidden',
        marginBottom: '1px', marginTop: is_projected || absence_reason === 'injury' ? '1px' : 0,
      }}>
        {topPanels.map(({ label, value, sub, color }) => (
          <div key={label} style={{
            background: 'var(--bg-1)', padding: '20px 24px',
            transition: 'background 0.15s ease',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-1)'}
          >
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-3)', letterSpacing: '0.5px', marginBottom: '10px' }}>
              {label}
            </p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '26px', fontWeight: 600, letterSpacing: '-0.6px', color, marginBottom: '6px' }}>
              {value}
            </p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-3)' }}>
              {sub}
            </p>
          </div>
        ))}
      </div>

      {/* ── Value comparison bars ─────────────────── */}
      <div style={{
        background: 'var(--bg-1)', border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)', padding: '20px 24px',
        marginBottom: '1px', display: 'flex', flexDirection: 'column', gap: '16px',
      }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-3)', letterSpacing: '0.3px' }}>
          Value comparison
        </p>
        <ValueBar
          label={is_projected ? 'Fair Value (projected)' : 'Fair Value'}
          value={fair_value_m} max={maxBar} positive
        />
        <ValueBar label="Salary Ask" value={salaryAsk} max={maxBar} />
      </div>

      {/* ── Injury risk card ─────────────────────── */}
      {valuation.durability_score != null && (
        <InjuryRiskCard
          profile={profile}
          valuation={{ ...valuation, requested_salary_m: salaryAsk }}
        />
      )}

      {/* ── Verdict ──────────────────────────────── */}
      <div style={{ marginBottom: '16px' }}>
        <VerdictCard
          decision={decision}
          efficiency_ratio={efficiency_ratio}
          overpay_pct={overpay_pct}
          fair_value_m={fair_value_m}
          requested_salary_m={salaryAsk}
        />
      </div>

      {/* ── Footnotes ────────────────────────────── */}
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-3)', textAlign: 'center', marginBottom: '8px' }}>
        Berri & Schmidt (2010) — 1 marginal win ≈ $3.8M · Durability: GP/82 × age curve
        {is_projected && ` · Projected from ${gp} GP`}
        {absence_reason === 'injury' && ` · Injury season — ${gp} GP not extrapolated`}
      </p>

      {decision === 'NEGOTIATE' && (
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--amber)', textAlign: 'center', marginBottom: '16px' }}>
          Suggested range: {fmtMoney(fair_value_m * 0.95)} – {fmtMoney(fair_value_m * 1.05)}
        </p>
      )}

      {/* ── Navigation ───────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
        <button onClick={onBack} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'var(--font-mono)', fontSize: '12px',
          color: 'var(--text-3)', transition: 'color 0.15s ease', padding: '8px 0',
        }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-1)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
        >
          ← Back
        </button>

        <button onClick={onNext} style={{
          padding: '9px 20px',
          background: 'var(--text-0)', color: 'var(--bg-0)',
          border: 'none', borderRadius: 'var(--r-md)',
          fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500,
          cursor: 'pointer', letterSpacing: '-0.1px',
          transition: 'opacity 0.15s ease',
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          onMouseDown={e => e.currentTarget.style.opacity = '0.72'}
          onMouseUp={e => e.currentTarget.style.opacity = '0.88'}
        >
          AI Report →
        </button>
      </div>

    </main>
  )
}