const VerdictCard = ({ valuation }) => {
  const getVerdictConfig = (recommendation) => {
    switch (recommendation) {
      case 'SIGN':
        return {
          bgColor: 'bg-green-50',
          borderColor: 'border-green-500',
          textColor: 'text-green-800',
          titleColor: 'text-green-900',
          icon: '✓',
        }
      case 'NEGOTIATE':
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-500',
          textColor: 'text-yellow-800',
          titleColor: 'text-yellow-900',
          icon: '↔',
        }
      case 'AVOID':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-500',
          textColor: 'text-red-800',
          titleColor: 'text-red-900',
          icon: '✗',
        }
      default:
        return {
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-500',
          textColor: 'text-gray-800',
          titleColor: 'text-gray-900',
          icon: '?',
        }
    }
  }

  const config = getVerdictConfig(valuation?.recommendation)

  return (
    <div className={`border-2 ${config.borderColor} ${config.bgColor} rounded-lg p-6`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-2xl font-bold ${config.titleColor}`}>
          {config.icon} {valuation?.recommendation || 'UNKNOWN'}
        </h3>
      </div>
      <p className={`${config.textColor} mb-4`}>
        {valuation?.reasoning || 'No reasoning provided'}
      </p>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <div className="text-sm text-gray-600">Annual Value</div>
          <div className="text-lg font-semibold">
            ${valuation?.annual_value?.toLocaleString() || 'N/A'}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Total Value</div>
          <div className="text-lg font-semibold">
            ${valuation?.total_value?.toLocaleString() || 'N/A'}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Contract Years</div>
          <div className="text-lg font-semibold">{valuation?.years || 'N/A'}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Impact Score</div>
          <div className="text-lg font-semibold">
            {valuation?.impact_score?.toFixed(2) || 'N/A'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerdictCard
