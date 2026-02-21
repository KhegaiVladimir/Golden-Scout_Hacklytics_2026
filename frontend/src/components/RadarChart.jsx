import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'

const RadarChartComponent = ({ data }) => {
  // Transform z-scores data for radar chart
  const chartData = [
    { stat: 'PTS', value: data?.PTS || 0 },
    { stat: 'TRB', value: data?.TRB || 0 },
    { stat: 'AST', value: data?.AST || 0 },
    { stat: 'STL', value: data?.STL || 0 },
    { stat: 'BLK', value: data?.BLK || 0 },
    { stat: 'PER', value: data?.PER || 0 },
  ]

  return (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart data={chartData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="stat" />
        <PolarRadiusAxis angle={90} domain={[-3, 3]} />
        <Radar
          name="Z-Score"
          dataKey="value"
          stroke="#3b82f6"
          fill="#3b82f6"
          fillOpacity={0.6}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}

export default RadarChartComponent
