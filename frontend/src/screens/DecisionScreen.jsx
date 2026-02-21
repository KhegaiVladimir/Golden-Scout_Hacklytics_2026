import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { analyzePlayer } from '../api/client'
import VerdictCard from '../components/VerdictCard'
import Skeleton from '../components/Skeleton'

const DecisionScreen = () => {
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const playerName = sessionStorage.getItem('playerName')
    const contractValue = parseFloat(sessionStorage.getItem('contractValue'))
    const contractYears = parseInt(sessionStorage.getItem('contractYears'))

    if (!playerName || !contractValue || !contractYears) {
      navigate('/')
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        const analysisData = await analyzePlayer(playerName, contractValue, contractYears)
        setAnalysis(analysisData)
      } catch (error) {
        console.error('Error fetching valuation:', error)
        alert('Error loading valuation data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [navigate])

  const handleNext = () => {
    navigate('/report')
  }

  const handleBack = () => {
    navigate('/simulation')
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (!analysis || !analysis.valuation) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-600">Error loading valuation data</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Contract Decision</h1>
        <p className="text-gray-600">
          Based on statistical analysis and market valuation
        </p>
      </div>

      <div className="max-w-3xl mx-auto mb-6">
        <VerdictCard valuation={analysis.valuation} />
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Contract Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600">Player</div>
            <div className="text-lg font-semibold">{sessionStorage.getItem('playerName')}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Total Contract Value</div>
            <div className="text-lg font-semibold">
              ${parseFloat(sessionStorage.getItem('contractValue')).toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Contract Years</div>
            <div className="text-lg font-semibold">{sessionStorage.getItem('contractYears')} years</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Annual Average Value</div>
            <div className="text-lg font-semibold">
              ${(parseFloat(sessionStorage.getItem('contractValue')) / parseInt(sessionStorage.getItem('contractYears'))).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={handleBack}
          className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={handleNext}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          View AI Report →
        </button>
      </div>
    </div>
  )
}

export default DecisionScreen
