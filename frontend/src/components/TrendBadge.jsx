const CONFIG = {
  TRENDING_UP:   { icon: '↑', label: 'HOT STREAK', cls: 'bg-green-900/50 text-green-300 border-green-700' },
  TRENDING_DOWN: { icon: '↓', label: 'COLD SPELL',  cls: 'bg-red-900/50   text-red-300   border-red-700'   },
  STEADY:        { icon: '→', label: 'STEADY',       cls: 'bg-slate-800    text-slate-300  border-slate-600' },
}

export default function TrendBadge({ trend }) {
  const cfg = CONFIG[trend] || CONFIG.STEADY
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-mono text-xs uppercase tracking-wider ${cfg.cls}`}>
      <span>{cfg.icon}</span>
      {cfg.label}
    </span>
  )
}