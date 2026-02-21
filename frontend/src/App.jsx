import { useState } from 'react'
import { fetchProfile, runSimulation, calculateValue, generateReport } from './api/client'
import SearchScreen     from './screens/SearchScreen'
import ProfileScreen    from './screens/ProfileScreen'
import SimulationScreen from './screens/SimulationScreen'
import DecisionScreen   from './screens/DecisionScreen'
import ReportScreen     from './screens/ReportScreen'

const STEPS = ['Profile', 'Simulation', 'Decision', 'Report']
const STEP_SCREENS = ['profile', 'simulation', 'decision', 'report']

function NavBar({ screen, onNavigate }) {
  const currentIdx = STEP_SCREENS.indexOf(screen)
  if (currentIdx === -1) return null

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-scout-border/60 bg-scout-bg/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <button
          onClick={() => onNavigate('search')}
          className="font-mono text-scout-gold font-bold text-lg tracking-widest hover:opacity-70 transition-opacity"
        >
          GOLDEN SCOUT
        </button>

        <nav className="flex items-center">
          {STEPS.map((step, i) => {
            const done   = i < currentIdx
            const active = i === currentIdx
            return (
              <button
                key={step}
                onClick={() => done && onNavigate(STEP_SCREENS[i])}
                disabled={!done && !active}
                className={`relative px-4 py-4 font-mono text-xs tracking-widest uppercase transition-all
                  ${active   ? 'text-scout-teal' : ''}
                  ${done     ? 'text-scout-gold cursor-pointer hover:text-scout-gold/70' : ''}
                  ${!done && !active ? 'text-scout-muted cursor-default' : ''}
                `}
              >
                {done ? <span className="mr-1">✓</span> : null}
                {step}
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-scout-teal rounded-full" />
                )}
                {i < STEPS.length - 1 && (
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 text-scout-border text-xs">›</span>
                )}
              </button>
            )
          })}
        </nav>

        <div className="font-mono text-xs text-scout-muted w-28 text-right truncate">
          {screen !== 'search' ? sessionStorage.getItem('playerName') : ''}
        </div>
      </div>
    </header>
  )
}

export default function App() {
  const [screen, setScreen] = useState('search')
  const [playerData, setPlayerData] = useState({
    profile: null, simulation: null, valuation: null, report: null,
    teamWins: 38, salaryAsk: 20,
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const handleEvaluate = async (playerName, teamWins, salaryAsk) => {
    setLoading(true)
    setError(null)
    sessionStorage.setItem('playerName', playerName)

    const profile = await fetchProfile(playerName)
    if (!profile) {
      setError('Player not found. Check spelling and try again.')
      setLoading(false)
      return
    }

    const sim = await runSimulation(profile.impact_score, teamWins, profile.gp, profile.stats?.mp ?? 30)
    const val = await calculateValue(sim?.wins_added ?? 0, salaryAsk)
    const rep = await generateReport({
      player:           profile.player,
      position:         profile.position,
      impact_score:     profile.impact_score,
      percentile:       profile.percentile,
      trend_signal:     profile.trend_signal,
      wins_added:       sim?.wins_added       ?? 0,
      expected_wins:    sim?.expected_wins    ?? 0,
      playoff_prob:     sim?.playoff_prob     ?? 0,
      fair_value_m:     val?.fair_value_m     ?? 0,
      efficiency_ratio: val?.efficiency_ratio ?? 0,
      overpay_pct:      val?.overpay_pct      ?? 0,
      decision:         val?.decision         ?? 'NEGOTIATE',
      requested_salary_m: salaryAsk,
      current_team_wins:  teamWins,
    })

    setPlayerData({ profile, simulation: sim, valuation: val, report: rep, teamWins, salaryAsk })
    setLoading(false)
    setScreen('profile')
  }

  const nav = (s) => setScreen(s)
  const isSearch = screen === 'search'

  return (
    <div className="min-h-screen bg-scout-bg relative">
      <NavBar screen={screen} onNavigate={nav} />
      <div className={isSearch ? '' : 'pt-14'}>
        {screen === 'search'     && <SearchScreen    onEvaluate={handleEvaluate} loading={loading} error={error} />}
        {screen === 'profile'    && <ProfileScreen   data={playerData} onNext={() => nav('simulation')} onBack={() => nav('search')} />}
        {screen === 'simulation' && <SimulationScreen data={playerData} onNext={() => nav('decision')}  onBack={() => nav('profile')} />}
        {screen === 'decision'   && <DecisionScreen  data={playerData} onNext={() => nav('report')}     onBack={() => nav('simulation')} />}
        {screen === 'report'     && <ReportScreen    data={playerData} onBack={() => nav('decision')} />}
      </div>
    </div>
  )
}