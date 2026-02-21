import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis } from 'recharts'

export default function PlayerRadarChart({ radar }) {
  if (!radar) return null

  const data = [
    { axis: 'Scoring',    value: radar.scoring },
    { axis: 'Defense',    value: radar.defense },
    { axis: 'Playmkg.',   value: radar.playmaking },
    { axis: 'Efficiency', value: radar.efficiency },
    { axis: 'Consist.',   value: radar.consistency },
    { axis: 'Durable',    value: radar.durability },
  ]

  return (
    <div className="radar-fade">
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart
          data={data}
          cx="50%"
          cy="50%"
          outerRadius="58%"
          margin={{ top: 12, right: 28, bottom: 12, left: 28 }}
        >
          <PolarGrid stroke="#1e293b" />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'DM Mono, monospace' }}
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
