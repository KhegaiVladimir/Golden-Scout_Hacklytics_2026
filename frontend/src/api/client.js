import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const searchPlayers = async (query) => {
  const response = await client.post('/api/search', { query })
  return response.data
}

export const getPlayer = async (playerName) => {
  const response = await client.get(`/api/player/${encodeURIComponent(playerName)}`)
  return response.data
}

export const analyzePlayer = async (playerName, contractValue, contractYears) => {
  const response = await client.post('/api/analyze', {
    player_name: playerName,
    contract_value: contractValue,
    contract_years: contractYears,
  })
  return response.data
}

export const generateReport = async (playerName, contractValue, contractYears) => {
  const response = await client.post('/api/report', {
    player_name: playerName,
    contract_value: contractValue,
    contract_years: contractYears,
  })
  return response.data
}

export const generateAudio = async (playerName, contractValue, contractYears) => {
  const response = await client.post('/api/audio', {
    player_name: playerName,
    contract_value: contractValue,
    contract_years: contractYears,
  })
  return response.data
}

export default client
