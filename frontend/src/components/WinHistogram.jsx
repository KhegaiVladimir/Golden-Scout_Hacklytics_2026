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

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const { wins, count } = payload[0].payload
  return (
    <div className="bg-scout-card border border-scout-border rounded-lg px-3 py-2">
      <p className="font-mono text-xs text-scout-muted">{wins}–{wins + 2} wins</p>
      <p className="font-mono text-sm font-bold text-scout-text">{count.toLocaleString()} <span className="text-scout-muted font-normal">sims</span></p>
    </div>
  )
}

export default function WinHistogram({ win_distribution, expected_wins, current_wins }) {
  if (!win_distribution?.length) return null
  const data = buildHistogram(win_distribution)

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} barSize={12} margin={{ top: 5, right: 10, left: -20, bottom: 20 }}>
        <XAxis
          dataKey="wins"
          tick={{ fill: '#4B5C6B', fontSize: 10, fontFamily: 'DM Mono, monospace' }}
          axisLine={{ stroke: '#1c2333' }}
          tickLine={false}
          label={{ value: 'Season Wins', position: 'insideBottom', offset: -12, fill: '#4B5C6B', fontSize: 10, fontFamily: 'DM Mono, monospace' }}
        />
        <YAxis hide />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        {current_wins && (
          <ReferenceLine x={current_wins} stroke="rgba(239,68,68,0.6)" strokeDasharray="4 3" strokeWidth={1.5} />
        )}
        {expected_wins && (
          <ReferenceLine x={Math.round(expected_wins)} stroke="rgba(245,166,35,0.7)" strokeDasharray="4 3" strokeWidth={1.5} />
        )}
        <Bar dataKey="count" radius={[3, 3, 0, 0]}>
          {data.map(entry => (
            <Cell
              key={entry.wins}
              fill={Math.abs(entry.wins - expected_wins) < 3
                ? '#00C9E0'
                : 'rgba(0,201,224,0.18)'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}