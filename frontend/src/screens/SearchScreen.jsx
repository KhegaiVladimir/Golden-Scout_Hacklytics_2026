import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchBar from '../components/SearchBar'

const SearchScreen = () => {
  const [playerName, setPlayerName] = useState('')
  const [contractValue, setContractValue] = useState('')
  const [contractYears, setContractYears] = useState('')
  const navigate = useNavigate()

  const handleSearch = () => {
    if (!playerName || !contractValue || !contractYears) {
      alert('Please fill in all fields')
      return
    }

    // Store in sessionStorage for other screens
    sessionStorage.setItem('playerName', playerName)
    sessionStorage.setItem('contractValue', contractValue)
    sessionStorage.setItem('contractYears', contractYears)

    navigate('/profile')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-center mb-2">Golden Scout</h1>
        <p className="text-center text-gray-600 mb-8">NBA Player Analysis & Valuation</p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Player Name
            </label>
            <SearchBar
              onSelectPlayer={setPlayerName}
              placeholder="Search for a player..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contract Value (Total)
            </label>
            <input
              type="number"
              value={contractValue}
              onChange={(e) => setContractValue(e.target.value)}
              placeholder="e.g., 100000000"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contract Years
            </label>
            <input
              type="number"
              value={contractYears}
              onChange={(e) => setContractYears(e.target.value)}
              placeholder="e.g., 2"
              min="1"
              max="10"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={handleSearch}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Analyze Player
          </button>
        </div>
      </div>
    </div>
  )
}

export default SearchScreen
