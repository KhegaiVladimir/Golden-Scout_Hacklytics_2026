import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const WinHistogram = ({ simulationData }) => {
  // Create histogram bins from wins distribution
  const createHistogram = (winsDistribution) => {
    const bins = {}
    winsDistribution.forEach((wins) => {
      const bin = Math.floor(wins / 2) * 2 // Group into bins of 2
      bins[bin] = (bins[bin] || 0) + 1
    })
    
    return Object.entries(bins)
      .map(([wins, count]) => ({ wins: parseInt(wins), count }))
      .sort((a, b) => a.wins - b.wins)
  }

  const histogramData = simulationData?.wins_distribution
    ? createHistogram(simulationData.wins_distribution)
    : []

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">Season Win Distribution</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={histogramData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="wins" label={{ value: 'Wins', position: 'insideBottom', offset: -5 }} />
          <YAxis label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Bar dataKey="count" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
      {simulationData && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-sm text-gray-600">Mean Wins</div>
            <div className="text-xl font-bold">{simulationData.mean_wins?.toFixed(1)}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-sm text-gray-600">Median Wins</div>
            <div className="text-xl font-bold">{simulationData.median_wins?.toFixed(1)}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-sm text-gray-600">25th Percentile</div>
            <div className="text-xl font-bold">{simulationData.percentile_25?.toFixed(1)}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-sm text-gray-600">75th Percentile</div>
            <div className="text-xl font-bold">{simulationData.percentile_75?.toFixed(1)}</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WinHistogram
