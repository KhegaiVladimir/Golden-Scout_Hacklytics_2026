const CONFIG = {
  TRENDING_UP:   { icon: '↑', label: 'Hot Streak', cls: 'text-scout-green  bg-scout-green/10  border-scout-green/25'  },
  TRENDING_DOWN: { icon: '↓', label: 'Cold Spell',  cls: 'text-scout-red   bg-scout-red/10    border-scout-red/25'    },
  STEADY:        { icon: '→', label: 'Steady',       cls: 'text-scout-dim   bg-scout-card2     border-scout-border'    },
}

export default function TrendBadge({ trend }) {
  const cfg = CONFIG[trend] || CONFIG.STEADY
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono text-xs ${cfg.cls}`}>
      {cfg.icon} {cfg.label}
    </span>
  )
}