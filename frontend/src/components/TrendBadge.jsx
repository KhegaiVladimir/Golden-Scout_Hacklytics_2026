const TrendBadge = ({ trend }) => {
  const getTrendConfig = (trend) => {
    switch (trend) {
      case 'HOT':
        return {
          text: '↑ HOT',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-300',
        }
      case 'COLD':
        return {
          text: '↓ COLD',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-300',
        }
      case 'STEADY':
        return {
          text: '→ STEADY',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-300',
        }
      default:
        return {
          text: '→ STEADY',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-300',
        }
    }
  }

  const config = getTrendConfig(trend)

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${config.bgColor} ${config.textColor} ${config.borderColor}`}
    >
      {config.text}
    </span>
  )
}

export default TrendBadge
