import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPlayer, analyzePlayer } from '../api/client'
import RadarChart from '../components/RadarChart'
import StatTable from '../components/StatTable'
import TrendBadge from '../components/TrendBadge'
import Skeleton from '../components/Skeleton'

const ProfileScreen = () => {
  const [player, setPlayer] = useState(null)
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
        const playerData = await getPlayer(playerName)
        setPlayer(playerData)

        const analysisData = await analyzePlayer(playerName, contractValue, contractYears)
        setAnalysis(analysisData)
      } catch (error) {
        console.error('Error fetching data:', error)
        alert('Error loading player data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [navigate])

  const handleNext = () => {
    navigate('/simulation')
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-64 mb-4" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (!player || !analysis) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-600">Error loading player data</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{player.name || player.Player}</h1>
        <div className="flex items-center gap-4">
          <TrendBadge trend={analysis.trend} />
          <span className="text-gray-600">
            Impact Score: <span className="font-semibold">{analysis.impact_score?.toFixed(2)}</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Performance Radar</h2>
          <RadarChart data={analysis.z_scores} />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Key Metrics</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Points per Game</span>
              <span className="font-semibold">{player.PTS?.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Rebounds per Game</span>
              <span className="font-semibold">{player.TRB?.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Assists per Game</span>
              <span className="font-semibold">{player.AST?.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Player Efficiency Rating</span>
              <span className="font-semibold">{player.PER?.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Win Shares</span>
              <span className="font-semibold">{player.WS?.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">VORP</span>
              <span className="font-semibold">{player.VORP?.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Detailed Statistics</h2>
        <StatTable
          player={player}
          zScores={analysis.z_scores}
          percentiles={analysis.percentiles}
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleNext}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          View Simulation →
        </button>
      </div>
    </div>
  )
}

export default ProfileScreen
