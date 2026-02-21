import axios from 'axios'
import { USE_MOCK, mockProfile, mockSimulation, mockValuation, mockReport } from '../mockData'

const api = axios.create({ baseURL: 'http://localhost:8000' })

export const fetchPlayers = async () => {
  if (USE_MOCK) return ["Jayson Tatum", "LeBron James", "Stephen Curry"]
  try { return (await api.get('/players')).data } catch { return [] }
}

export const fetchProfile = async (name) => {
  if (USE_MOCK) return mockProfile
  try {
    return (await api.get(`/player/${encodeURIComponent(name)}/profile`)).data
  } catch { return null }
}

export const runSimulation = async (impact_score, current_team_wins) => {
  if (USE_MOCK) return mockSimulation
  try {
    return (await api.post('/simulate', { impact_score, current_team_wins })).data
  } catch { return null }
}

export const calculateValue = async (wins_added, requested_salary_m) => {
  if (USE_MOCK) return mockValuation
  try {
    return (await api.post('/value', { wins_added, requested_salary_m, value_per_win: 3.8 })).data
  } catch { return null }
}

export const generateReport = async (computed_results) => {
  if (USE_MOCK) return mockReport
  try {
    return (await api.post('/report', { computed_results })).data
  } catch { return null }
}

export const generateAudio = async (text, player_name) => {
  try {
    const res = await api.post('/audio', { text, player_name }, { responseType: 'blob' })
    return URL.createObjectURL(res.data)
  } catch { return null }
}