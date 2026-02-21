import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { analyzePlayer } from '../api/client'
import WinHistogram from '../components/WinHistogram'
import Skeleton from '../components/Skeleton'

const SimulationScreen = () => {
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
        console.error('Error fetching simulation:', error)
        alert('Error loading simulation data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [navigate])

  const handleNext = () => {
    navigate('/decision')
  }

  const handleBack = () => {
    navigate('/profile')
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-96 mb-4" />
      </div>
    )
  }

  if (!analysis || !analysis.simulation) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-600">Error loading simulation data</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Season Simulation</h1>
        <p className="text-gray-600">
          Monte Carlo simulation of potential season outcomes based on player performance
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <WinHistogram simulationData={analysis.simulation} />
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Simulation Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-600">Minimum Wins</div>
            <div className="text-2xl font-bold">{analysis.simulation.min_wins}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Maximum Wins</div>
            <div className="text-2xl font-bold">{analysis.simulation.max_wins}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Standard Deviation</div>
            <div className="text-2xl font-bold">{analysis.simulation.std_wins?.toFixed(1)}</div>
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
          View Decision →
        </button>
      </div>
    </div>
  )
}

export default SimulationScreen
