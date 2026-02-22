// StatTable.jsx
function zColor(z) {
  if (z == null) return 'var(--text-3)'
  return z > 0 ? 'var(--green)' : 'var(--red)'
}

function zToPercentile(z) {
  if (z == null) return null
  return Math.min(99, Math.max(1, Math.round(50 + z * 15)))
}

function PctBadge({ pct }) {
  if (pct == null) return <span style={{ color: 'var(--text-3)' }}>—</span>
  const color = pct >= 80 ? 'var(--green)' : pct >= 50 ? 'var(--amber)' : 'var(--red)'
  return (
    <span style={{
      fontFamily: 'var(--font-mono)', fontSize: '10px',
      fontWeight: 600, color,
    }}>
      {pct}th
    </span>
  )
}

function CVBadge({ cv }) {
  if (cv == null) return null
  const cfg = cv < 25  ? { label: 'Reliable', color: 'var(--green)', subtle: 'var(--green-subtle)', border: 'var(--green-border)' }
            : cv <= 40 ? { label: 'Moderate', color: 'var(--amber)', subtle: 'var(--amber-subtle)', border: 'var(--amber-border)' }
            :            { label: 'Volatile',  color: 'var(--red)',   subtle: 'var(--red-subtle)',   border: 'var(--red-border)'   }
  return (
    <span style={{
      marginLeft: '6px',
      fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 600,
      color: cfg.color, background: cfg.subtle,
      border: `1px solid ${cfg.border}`,
      padding: '1px 5px', borderRadius: '3px',
      letterSpacing: '0.3px',
    }}>
      {cfg.label}
    </span>
  )
}

export default function StatTable({ profile }) {
  if (!profile) return null
  const {
    stats, z_scores, ts_pct, pos_avg_ts,
    pos_avg_pts, pos_avg_ast, pos_avg_reb,
    pos_avg_stl_blk, pos_avg_tov, cv, impact_score,
  } = profile

  const fmt = v => v != null ? v : '—'

  const rows = [
    { metric: 'True Shooting %',  value: `${ts_pct}%`,                  posAvg: `${pos_avg_ts}%`,      z: z_scores.ts_pct,  colorZ: z_scores.ts_pct },
    { metric: 'Impact Score',     value: impact_score.toFixed(2),        posAvg: '0.00',                z: impact_score,     colorZ: impact_score },
    { metric: 'Consistency (CV)', value: cv,                             posAvg: '—',                   z: null,             colorZ: null, cvBadge: true },
    { metric: 'Points',           value: stats.pts,                      posAvg: fmt(pos_avg_pts),      z: z_scores.pts,     colorZ: z_scores.pts },
    { metric: 'Assists',          value: stats.ast,                      posAvg: fmt(pos_avg_ast),      z: z_scores.ast,     colorZ: z_scores.ast },
    { metric: 'Rebounds',         value: stats.reb,                      posAvg: fmt(pos_avg_reb),      z: z_scores.reb,     colorZ: z_scores.reb },
    { metric: 'Stl + Blk',        value: `${stats.stl} + ${stats.blk}`, posAvg: fmt(pos_avg_stl_blk), z: z_scores.defense, colorZ: z_scores.defense },
    { metric: 'Turnovers',        value: stats.tov,                      posAvg: fmt(pos_avg_tov),      z: z_scores.tov,     colorZ: -(z_scores.tov ?? 0) },
  ]

  const cellStyle = {
    fontFamily: 'var(--font-mono)', fontSize: '12px',
    padding: '9px 8px', borderBottom: '1px solid var(--border)',
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          {['Metric', 'Value', 'Pos. Avg', 'Z', 'Pctile'].map((h, i) => (
            <th key={h} style={{
              fontFamily: 'var(--font-mono)', fontSize: '10px',
              color: 'var(--text-3)', letterSpacing: '0.5px',
              textAlign: i === 0 ? 'left' : 'right',
              padding: '0 8px 10px',
              borderBottom: '1px solid var(--border)',
              fontWeight: 400,
            }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => {
          const pct = zToPercentile(row.colorZ)
          const isLast = ri === rows.length - 1
          return (
            <tr key={row.metric}
              style={{ transition: 'background 0.1s ease' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {/* Metric */}
              <td style={{ ...cellStyle, textAlign: 'left', color: 'var(--text-1)', borderBottom: isLast ? 'none' : '1px solid var(--border)' }}>
                {row.metric}
              </td>
              {/* Value */}
              <td style={{ ...cellStyle, textAlign: 'right', color: 'var(--text-0)', borderBottom: isLast ? 'none' : '1px solid var(--border)' }}>
                {row.cvBadge
                  ? <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                      {row.value}<CVBadge cv={cv} />
                    </span>
                  : row.value
                }
              </td>
              {/* Pos Avg */}
              <td style={{ ...cellStyle, textAlign: 'right', color: 'var(--text-3)', borderBottom: isLast ? 'none' : '1px solid var(--border)' }}>
                {row.posAvg}
              </td>
              {/* Z score */}
              <td style={{ ...cellStyle, textAlign: 'right', fontWeight: 600, color: zColor(row.colorZ), borderBottom: isLast ? 'none' : '1px solid var(--border)' }}>
                {row.z != null ? (row.z > 0 ? '+' : '') + row.z.toFixed(2) : '—'}
              </td>
              {/* Percentile */}
              <td style={{ ...cellStyle, textAlign: 'right', borderBottom: isLast ? 'none' : '1px solid var(--border)' }}>
                <PctBadge pct={pct} />
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}