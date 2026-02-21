import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis } from 'recharts'

export default function PlayerRadarChart({ radar }) {
  if (!radar) return null

  const data = [
    { axis: 'Scoring',     value: radar.scoring },
    { axis: 'Defense',     value: radar.defense },
    { axis: 'Playmaking',  value: radar.playmaking },
    { axis: 'Efficiency',  value: radar.efficiency },
    { axis: 'Consistency', value: radar.consistency },
    { axis: 'Durability',  value: radar.durability },
  ]

  return (
    <div className="radar-fade">
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data}>
          <PolarGrid stroke="#1e293b" />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fill: '#64748B', fontSize: 12, fontFamily: 'DM Mono, monospace' }}
          />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            dataKey="value"
            stroke="#00B4D8"
            fill="#00B4D8"
            fillOpacity={0.2}
            strokeWidth={2}
            dot={{ r: 3, fill: '#00B4D8', strokeWidth: 0 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}