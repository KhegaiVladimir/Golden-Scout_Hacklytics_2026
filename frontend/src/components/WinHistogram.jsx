// WinHistogram.jsx
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ReferenceLine, ResponsiveContainer, Cell,
} from 'recharts'

function buildHistogram(distribution, binSize = 2) {
  const counts = {}
  distribution.forEach(w => {
    const bin = Math.floor(w / binSize) * binSize
    counts[bin] = (counts[bin] || 0) + 1
  })
  return Object.entries(counts)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([wins, count]) => ({ wins: parseInt(wins), count }))
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { wins, count } = payload[0].payload
  return (
    <div style={{
      background: 'var(--bg-1)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-sm)',
      padding: '8px 12px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
    }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-3)', marginBottom: '3px' }}>
        {wins}–{wins + 2} wins
      </p>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600, color: 'var(--text-0)' }}>
        {count.toLocaleString()}
        <span style={{ color: 'var(--text-3)', fontWeight: 400 }}> sims</span>
      </p>
    </div>
  )
}

export default function WinHistogram({ win_distribution, expected_wins, current_wins }) {
  if (!win_distribution?.length) return null
  const data = buildHistogram(win_distribution)

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart
        data={data} barSize={10}
        margin={{ top: 4, right: 8, left: -24, bottom: 20 }}
      >
        <XAxis
          dataKey="wins"
          tick={{ fill: '#444444', fontSize: 10, fontFamily: 'Geist Mono, monospace' }}
          axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
          tickLine={false}
          label={{
            value: 'Season Wins', position: 'insideBottom', offset: -12,
            fill: '#444444', fontSize: 10, fontFamily: 'Geist Mono, monospace',
          }}
        />
        <YAxis hide />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: 'rgba(255,255,255,0.02)' }}
        />

        {/* Current baseline — dim dashed */}
        {current_wins && (
          <ReferenceLine
            x={current_wins}
            stroke="rgba(255,255,255,0.15)"
            strokeDasharray="3 3"
            strokeWidth={1}
          />
        )}
        {/* Expected wins — slightly brighter */}
        {expected_wins && (
          <ReferenceLine
            x={Math.round(expected_wins)}
            stroke="rgba(255,255,255,0.35)"
            strokeDasharray="3 3"
            strokeWidth={1}
          />
        )}

        <Bar dataKey="count" radius={[2, 2, 0, 0]}>
          {data.map(entry => {
            const isNear = Math.abs(entry.wins - expected_wins) < 3
            return (
              <Cell
                key={entry.wins}
                fill={isNear
                  ? 'rgba(255,255,255,0.20)'
                  : 'rgba(255,255,255,0.06)'}
              />
            )
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}