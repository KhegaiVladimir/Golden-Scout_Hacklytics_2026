// VerdictCard.jsx
function fmtMoney(v) {
  if (v == null) return 'N/A'
  return v < 0 ? `-$${Math.abs(v).toFixed(1)}M` : `$${v.toFixed(1)}M`
}

const CFG = {
  SIGN: {
    label:  'SIGN',
    icon:   '✓',
    desc:   'Fair value meets or exceeds the salary ask.',
    color:  'var(--green)',
    subtle: 'var(--green-subtle)',
    border: 'var(--green-border)',
  },
  NEGOTIATE: {
    label:  'NEGOTIATE',
    icon:   '⟳',
    desc:   'Moderate overpay risk. Push for a better number.',
    color:  'var(--amber)',
    subtle: 'var(--amber-subtle)',
    border: 'var(--amber-border)',
  },
  AVOID: {
    label:  'AVOID',
    icon:   '✕',
    desc:   'Significant overpay. Contract does not justify the ask.',
    color:  'var(--red)',
    subtle: 'var(--red-subtle)',
    border: 'var(--red-border)',
  },
}

export default function VerdictCard({
  decision, efficiency_ratio, overpay_pct, fair_value_m, requested_salary_m,
}) {
  const cfg = CFG[decision] || CFG.NEGOTIATE

  const effColor = efficiency_ratio == null ? 'var(--text-3)'
    : efficiency_ratio >= 1   ? 'var(--green)'
    : efficiency_ratio >= 0.7 ? 'var(--amber)'
    :                           'var(--red)'

  const subPanels = [
    {
      label: 'Efficiency',
      value: efficiency_ratio != null ? `${efficiency_ratio.toFixed(2)}×` : 'N/A',
      color: effColor,
    },
    {
      label: 'Overpay',
      value: overpay_pct != null ? `${overpay_pct.toFixed(1)}%` : '—',
      color: 'var(--text-0)',
    },
    {
      label: 'Fair Value',
      value: fmtMoney(fair_value_m),
      color: fair_value_m < 0 ? 'var(--red)' : 'var(--text-0)',
    },
  ]

  return (
    <div style={{
      background: 'var(--bg-1)',
      border: `1px solid ${cfg.border}`,
      borderRadius: 'var(--r-lg)',
      overflow: 'hidden',
    }}>

      {/* Verdict band */}
      <div style={{
        background: cfg.subtle,
        padding: '24px',
        borderBottom: `1px solid ${cfg.border}`,
      }}>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: '10px',
          color: 'var(--text-3)', letterSpacing: '0.5px',
          marginBottom: '12px',
        }}>
          Executive Decision
        </p>

        {/* The verdict itself — the one colored element that earns it */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '11px',
            color: cfg.color, background: cfg.subtle,
            border: `1px solid ${cfg.border}`,
            borderRadius: '999px', padding: '3px 10px',
            fontWeight: 600, letterSpacing: '0.3px',
          }}>
            {cfg.icon}
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '36px',
            fontWeight: 600, letterSpacing: '-1px',
            color: cfg.color,
          }}>
            {cfg.label}
          </span>
        </div>

        <p style={{
          fontSize: '13px', color: 'var(--text-2)',
          lineHeight: 1.6, letterSpacing: '-0.1px',
        }}>
          {cfg.desc}
        </p>
      </div>

      {/* Sub-metric strip */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1px', background: cfg.border,
      }}>
        {subPanels.map(({ label, value, color }) => (
          <div key={label} style={{
            background: 'var(--bg-1)', padding: '16px 20px',
            transition: 'background 0.15s ease',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-1)'}
          >
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: '10px',
              color: 'var(--text-3)', letterSpacing: '0.5px',
              marginBottom: '8px',
            }}>
              {label}
            </p>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: '20px',
              fontWeight: 600, letterSpacing: '-0.4px', color,
            }}>
              {value}
            </p>
          </div>
        ))}
      </div>

    </div>
  )
}