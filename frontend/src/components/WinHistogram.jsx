import { BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer, Cell } from 'recharts'

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

export default function WinHistogram({ win_distribution, expected_wins, current_wins }) {
  if (!win_distribution?.length) return null
  const data = buildHistogram(win_distribution)

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} barSize={10}>
        <XAxis
          dataKey="wins"
          tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'DM Mono, monospace' }}
          label={{ value: 'Season Wins', position: 'insideBottom', offset: -2, fill: '#64748B', fontSize: 11 }}
        />
        <YAxis hide />
        <Tooltip
          contentStyle={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 8, fontFamily: 'DM Mono, monospace', fontSize: 11 }}
          formatter={(v, _, props) => [`${v.toLocaleString()} sims`, `${props.payload.wins}–${props.payload.wins + 1} wins`]}
          labelFormatter={() => ''}
        />
        {current_wins && (
          <ReferenceLine x={current_wins} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1.5}
            label={{ value: 'Current', fill: '#ef4444', fontSize: 10, fontFamily: 'DM Mono, monospace' }} />
        )}
        {expected_wins && (
          <ReferenceLine x={Math.round(expected_wins)} stroke="#F5A623" strokeDasharray="4 4" strokeWidth={1.5}
            label={{ value: 'Expected', fill: '#F5A623', fontSize: 10, fontFamily: 'DM Mono, monospace' }} />
        )}
        <Bar dataKey="count" radius={[2, 2, 0, 0]}>
          {data.map(entry => (
            <Cell
              key={entry.wins}
              fill={Math.abs(entry.wins - expected_wins) < 3 ? '#00B4D8' : 'rgba(0,180,216,0.25)'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}