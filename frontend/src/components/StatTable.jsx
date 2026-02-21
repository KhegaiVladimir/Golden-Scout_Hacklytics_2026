// z > 0 = green (good), z < 0 = red (bad)
// For turnovers pass -z so high TO = negative = red
function zColor(z) {
  if (z == null) return 'text-scout-muted'
  return z > 0 ? 'text-green-400' : 'text-red-400'
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

function CVBadge({ cv }) {
  if (cv == null) return null
  const { label, cls } =
    cv < 25  ? { label: 'Reliable', cls: 'text-green-400 bg-green-900/30 border-green-700/50' } :
    cv <= 40 ? { label: 'Moderate', cls: 'text-scout-amber bg-amber-900/30 border-amber-700/50' } :
               { label: 'Volatile', cls: 'text-red-400 bg-red-900/30 border-red-700/50' }
  return (
    <span className={`ml-1.5 px-1.5 py-0.5 text-[10px] font-mono font-bold rounded border ${cls}`}>
      {label}
    </span>
  )
}

export default function StatTable({ profile }) {
  if (!profile) return null
  const {
    stats, z_scores, ts_pct, pos_avg_ts,
    pos_avg_pts, pos_avg_ast, pos_avg_reb, pos_avg_stl_blk, pos_avg_tov,
    cv, impact_score
  } = profile

  const fmt = (v) => v != null ? v : '—'

  // colorZ is used for color + percentile; z is the raw displayed value.
  // For turnovers: high TO = high raw z = BAD → negate so color logic is uniform.
  const rows = [
    { metric: 'True Shooting %',  value: `${ts_pct}%`,                  posAvg: `${pos_avg_ts}%`,      z: z_scores.ts_pct,    colorZ: z_scores.ts_pct },
    { metric: 'Impact Score',     value: impact_score.toFixed(2),        posAvg: '0.00',                z: impact_score,       colorZ: impact_score },
    { metric: 'Consistency (CV)', value: cv,                             posAvg: '—',                   z: null,               colorZ: null,               cvBadge: true },
    { metric: 'Points',           value: stats.pts,                      posAvg: fmt(pos_avg_pts),      z: z_scores.pts,       colorZ: z_scores.pts },
    { metric: 'Assists',          value: stats.ast,                      posAvg: fmt(pos_avg_ast),      z: z_scores.ast,       colorZ: z_scores.ast },
    { metric: 'Rebounds',         value: stats.reb,                      posAvg: fmt(pos_avg_reb),      z: z_scores.reb,       colorZ: z_scores.reb },
    { metric: 'Stl + Blk',        value: `${stats.stl} + ${stats.blk}`, posAvg: fmt(pos_avg_stl_blk), z: z_scores.defense,   colorZ: z_scores.defense },
    // Turnovers: high z = many TOs = BAD → negate colorZ so red appears when z > 0
    { metric: 'Turnovers',        value: stats.tov,                      posAvg: fmt(pos_avg_tov),      z: z_scores.tov,       colorZ: -(z_scores.tov ?? 0) },
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
          const pct = zToPercentile(row.colorZ)
          return (
            <tr key={row.metric} className="hover:bg-white/[0.02] transition-colors">
              <td className="py-2 pr-3 text-scout-text text-xs">
                {row.metric}
              </td>
              <td className="py-2 px-2 text-right font-mono text-xs text-scout-text">
                {row.cvBadge
                  ? <span className="inline-flex items-center justify-end gap-0.5">
                      <span>{row.value}</span>
                      <CVBadge cv={cv} />
                    </span>
                  : row.value
                }
              </td>
              <td className="py-2 px-2 text-right font-mono text-xs text-scout-muted">{row.posAvg}</td>
              <td className={`py-2 px-2 text-right font-mono text-xs font-bold ${zColor(row.colorZ)}`}>
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
