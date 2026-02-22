// RadarChart.jsx
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer,
} from 'recharts'

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
      <ResponsiveContainer width="100%" height={260}>
        <RadarChart
          data={data}
          cx="50%" cy="50%" outerRadius="58%"
          margin={{ top: 12, right: 28, bottom: 12, left: 28 }}
        >
          {/* Grid rings — barely visible, just structure */}
          <PolarGrid
            stroke="rgba(255,255,255,0.04)"
            gridType="polygon"
          />
          <PolarAngleAxis
            dataKey="axis"
            tick={{
              fill: '#444444',
              fontSize: 10,
              fontFamily: 'Geist Mono, SF Mono, monospace',
              letterSpacing: '0.3px',
            }}
          />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            dataKey="value"
            stroke="rgba(255,255,255,0.25)"
            fill="rgba(255,255,255,0.05)"
            fillOpacity={1}
            strokeWidth={1.5}
            dot={{ r: 2.5, fill: '#FAFAFA', strokeWidth: 0 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}