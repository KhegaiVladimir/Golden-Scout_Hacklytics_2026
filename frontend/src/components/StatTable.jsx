function zColor(z, inverted = false) {
  if (z == null) return 'text-scout-muted'
  const good = inverted ? z < 0 : z > 0
  return good ? 'text-green-400' : 'text-red-400'
}

function zToPercentile(z) {
  if (z == null) return null
  const p = Math.round(50 + z * 15)
  return Math.min(99, Math.max(1, p))
}

function PctBadge({ pct }) {
  if (pct == null) return <span className="text-scout-muted">—</span>
  const color = pct >= 80 ? 'text-green-400' : pct >= 50 ? 'text-scout-amber' : 'text-red-400'
  return <span className={`font-mono text-xs font-bold ${color}`}>{pct}th</span>
}

export default function StatTable({ profile }) {
  if (!profile) return null
  const { stats, z_scores, ts_pct, pos_avg_ts, cv, impact_score } = profile

  const rows = [
    { metric: 'True Shooting %',  value: `${ts_pct}%`,                   posAvg: `${pos_avg_ts}%`, z: z_scores.ts_pct },
    { metric: 'Impact Score',     value: impact_score.toFixed(2),         posAvg: '0.00',           z: impact_score },
    { metric: 'Consistency (CV)', value: cv,                              posAvg: '—',              z: null, note: 'lower = better' },
    { metric: 'Points',           value: stats.pts,                       posAvg: '—',              z: z_scores.pts },
    { metric: 'Assists',          value: stats.ast,                       posAvg: '—',              z: z_scores.ast },
    { metric: 'Rebounds',         value: stats.reb,                       posAvg: '—',              z: z_scores.reb },
    { metric: 'Stl + Blk',        value: `${stats.stl} + ${stats.blk}`,  posAvg: '—',              z: z_scores.defense },
    { metric: 'Turnovers',        value: stats.tov,                       posAvg: '—',              z: z_scores.tov,  inverted: true },
  ]

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-scout-muted font-mono text-xs uppercase tracking-wider border-b border-scout-border">
          <th className="text-left py-2 pr-3">Metric</th>
          <th className="text-right py-2 px-2">Value</th>
          <th className="text-right py-2 px-2">Pos. Avg</th>
          <th className="text-right py-2 px-2">Z</th>
          <th className="text-right py-2">Pctile</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-scout-border/50">
        {rows.map(row => {
          const pct = zToPercentile(row.inverted ? (row.z != null ? -row.z : null) : row.z)
          return (
            <tr key={row.metric} className="hover:bg-white/[0.02] transition-colors">
              <td className="py-2 pr-3 text-scout-text text-xs">
                {row.metric}
                {row.note && <span className="ml-1 text-scout-muted text-[10px]">({row.note})</span>}
              </td>
              <td className="py-2 px-2 text-right font-mono text-xs text-scout-text">{row.value}</td>
              <td className="py-2 px-2 text-right font-mono text-xs text-scout-muted">{row.posAvg}</td>
              <td className={`py-2 px-2 text-right font-mono text-xs font-bold ${zColor(row.z, row.inverted)}`}>
                {row.z != null ? (row.z > 0 ? '+' : '') + row.z.toFixed(2) : '—'}
              </td>
              <td className="py-2 text-right"><PctBadge pct={pct} /></td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}