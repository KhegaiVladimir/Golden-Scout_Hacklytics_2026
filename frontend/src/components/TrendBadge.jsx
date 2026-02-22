// TrendBadge.jsx
const CONFIG = {
  TRENDING_UP:   { icon: '↑', label: 'Hot Streak', color: 'var(--green)', subtle: 'var(--green-subtle)', border: 'var(--green-border)' },
  TRENDING_DOWN: { icon: '↓', label: 'Cold Spell',  color: 'var(--red)',   subtle: 'var(--red-subtle)',   border: 'var(--red-border)'   },
  STEADY:        { icon: '→', label: 'Steady',       color: 'var(--text-2)', subtle: 'transparent',       border: 'var(--border)'        },
}

export default function TrendBadge({ trend }) {
  const cfg = CONFIG[trend] || CONFIG.STEADY
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      fontFamily: 'var(--font-mono)', fontSize: '11px',
      color: cfg.color, background: cfg.subtle,
      border: `1px solid ${cfg.border}`,
      padding: '2px 8px', borderRadius: 'var(--r-sm)',
      letterSpacing: '0.2px',
    }}>
      {cfg.icon} {cfg.label}
    </span>
  )
}