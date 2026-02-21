const StatTable = ({ player, zScores, percentiles }) => {
  const stats = [
    { key: 'PTS', label: 'Points' },
    { key: 'TRB', label: 'Rebounds' },
    { key: 'AST', label: 'Assists' },
    { key: 'STL', label: 'Steals' },
    { key: 'BLK', label: 'Blocks' },
    { key: 'FG%', label: 'FG%' },
    { key: '3P%', label: '3P%' },
    { key: 'FT%', label: 'FT%' },
    { key: 'PER', label: 'PER' },
    { key: 'TS%', label: 'TS%' },
    { key: 'WS', label: 'Win Shares' },
    { key: 'BPM', label: 'BPM' },
    { key: 'VORP', label: 'VORP' },
  ]

  const formatValue = (value) => {
    if (value === null || value === undefined) return 'N/A'
    if (typeof value === 'number') {
      if (value < 1) return value.toFixed(3)
      return value.toFixed(1)
    }
    return value
  }

  const getZScoreColor = (zScore) => {
    if (zScore > 1) return 'text-green-600'
    if (zScore > 0) return 'text-blue-600'
    if (zScore > -1) return 'text-gray-600'
    return 'text-red-600'
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stat
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Value
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Z-Score
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Percentile
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {stats.map((stat) => {
            const value = player?.[stat.key]
            const zScore = zScores?.[stat.key] || 0
            const percentile = percentiles?.[stat.key] || 0

            return (
              <tr key={stat.key}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {stat.label}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatValue(value)}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${getZScoreColor(zScore)}`}>
                  {zScore.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {percentile.toFixed(1)}%
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default StatTable
