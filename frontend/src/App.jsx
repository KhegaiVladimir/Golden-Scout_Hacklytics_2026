import { useState, useEffect } from 'react'
import { fetchProfile, runSimulation, calculateValue, generateReport, fetchPlayers } from './api/client'
import LandingPage      from './screens/LandingPage'
import SearchScreen     from './screens/SearchScreen'
import ProfileScreen    from './screens/ProfileScreen'
import SimulationScreen from './screens/SimulationScreen'
import DecisionScreen   from './screens/DecisionScreen'
import ReportScreen     from './screens/ReportScreen'
import TradeScreen      from './screens/TradeScreen'
import CompareScreen    from './screens/CompareScreen'

const STEPS        = ['Profile', 'Simulation', 'Decision', 'Report']
const STEP_SCREENS = ['profile', 'simulation', 'decision', 'report']
const APP_SCREENS  = ['search', 'profile', 'simulation', 'decision', 'report']

/* ─── NAV BAR ─────────────────────────────────────────────── */
function NavBar({ screen, onNavigate }) {
  const isLanding  = screen === 'landing'
  const isApp      = APP_SCREENS.includes(screen)
  const isTrade    = screen === 'trade'
  const isCompare  = screen === 'compare'
  const currentIdx = STEP_SCREENS.indexOf(screen)

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      borderBottom: '1px solid var(--border)',
      background: 'rgba(9,9,9,0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
    }}>

      {/* ── Main nav row ─────────────────────────── */}
      <div style={{
        maxWidth: '1080px', margin: '0 auto',
        padding: '0 24px', height: '56px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>

        {/* Logo */}
        <button onClick={() => onNavigate('landing')} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-0)', fontWeight: 600, fontSize: '14px',
          letterSpacing: '-0.2px', flexShrink: 0,
        }}>
          <span style={{
            width: '22px', height: '22px', borderRadius: '5px',
            background: 'linear-gradient(135deg, #FAFAFA 0%, #888 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-mono)', fontSize: '10px',
            fontWeight: 600, color: 'var(--bg-0)', flexShrink: 0,
          }}>GS</span>
          Golden Scout
        </button>

        {/* Center — landing: nav links that GO to screens */}
        {isLanding && (
          <nav style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            {[
              { label: 'App',       target: 'search'  },
              { label: 'Compare',   target: 'compare' },
              { label: 'Trade Sim', target: 'trade'   },
            ].map(({ label, target }) => (
              <button key={label} onClick={() => onNavigate(target)} style={{
                fontFamily: 'var(--font-mono)', fontSize: '11px',
                color: 'var(--text-2)', padding: '6px 12px',
                borderRadius: 'var(--r-sm)',
                background: 'none', border: 'none',
                cursor: 'pointer',
                transition: 'color 0.15s ease',
                letterSpacing: '0.2px',
              }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-0)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}
              >
                {label}
              </button>
            ))}
          </nav>
        )}

        {/* Center — step breadcrumb on inner app screens */}
        {currentIdx !== -1 && (
          <nav style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            {STEPS.map((step, i) => {
              const done = i < currentIdx, active = i === currentIdx
              return (
                <button key={step}
                  onClick={() => done && onNavigate(STEP_SCREENS[i])}
                  disabled={!done && !active}
                  style={{
                    position: 'relative', padding: '6px 12px',
                    background: 'none', border: 'none',
                    borderRadius: 'var(--r-sm)',
                    cursor: done ? 'pointer' : 'default',
                    fontFamily: 'var(--font-mono)', fontSize: '11px',
                    letterSpacing: '0.5px',
                    color: active ? 'var(--text-0)' : done ? 'var(--text-2)' : 'var(--text-3)',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={e => { if (done) e.currentTarget.style.color = 'var(--text-1)' }}
                  onMouseLeave={e => { if (done) e.currentTarget.style.color = done ? 'var(--text-2)' : 'var(--text-3)' }}
                >
                  {done && <span style={{ marginRight: '4px', color: 'var(--green)', fontSize: '9px' }}>✓</span>}
                  {step}
                  {active && (
                    <span style={{
                      position: 'absolute', bottom: 0,
                      left: '12px', right: '12px',
                      height: '1px', background: 'var(--text-0)',
                      borderRadius: '999px',
                    }} />
                  )}
                  {i < STEPS.length - 1 && (
                    <span style={{
                      position: 'absolute', right: '-1px',
                      color: 'var(--text-3)', fontSize: '12px',
                      fontWeight: 300, pointerEvents: 'none',
                    }}>›</span>
                  )}
                </button>
              )
            })}
          </nav>
        )}

        {/* Center — side screen label */}
        {(isTrade || isCompare) && (
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '11px',
            color: 'var(--text-2)', padding: '3px 10px',
            border: '1px solid var(--border)', borderRadius: '999px',
            letterSpacing: '0.3px',
          }}>
            {isTrade ? 'Trade Simulator' : 'Player Comparison'}
          </span>
        )}

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>

          {/* Landing: Launch App button */}
          {isLanding && (
            <button onClick={() => onNavigate('search')} style={{
              padding: '7px 16px',
              background: 'var(--text-0)', color: 'var(--bg-0)',
              border: 'none', borderRadius: 'var(--r-md)',
              fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 500,
              cursor: 'pointer', letterSpacing: '-0.1px',
              transition: 'opacity 0.15s ease',
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Launch App →
            </button>
          )}

          {/* App / trade / compare: Compare + Trade buttons */}
          {!isLanding && (
            <>
              {['Compare', 'Trade'].map(label => {
                const key    = label === 'Trade' ? 'trade' : 'compare'
                const active = screen === key
                return (
                  <button key={label} onClick={() => onNavigate(key)} style={{
                    fontFamily: 'var(--font-mono)', fontSize: '11px',
                    letterSpacing: '0.3px', padding: '5px 10px',
                    background: active ? 'var(--bg-2)' : 'none',
                    border: active ? '1px solid var(--border-active)' : '1px solid transparent',
                    borderRadius: 'var(--r-sm)',
                    color: active ? 'var(--text-1)' : 'var(--text-3)',
                    cursor: 'pointer', transition: 'all 0.15s ease',
                  }}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.color = 'var(--text-1)'; e.currentTarget.style.background = 'var(--bg-2)' } }}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'none' } }}
                  >
                    {label}
                  </button>
                )
              })}

              {/* Active player name */}
              {!['search', 'trade', 'compare'].includes(screen) && (
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '11px',
                  color: 'var(--text-3)', marginLeft: '8px',
                  maxWidth: '120px', overflow: 'hidden',
                  textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {sessionStorage.getItem('playerName')}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── App sub-tabs row ─────────────────────── */}
      {isApp && (
        <div style={{
          borderTop: '1px solid var(--border)',
          background: 'rgba(9,9,9,0.95)',
        }}>
          <div style={{
            maxWidth: '1080px', margin: '0 auto',
            padding: '0 24px', height: '36px',
            display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            {APP_SCREENS.map((key) => {
              const label          = key.charAt(0).toUpperCase() + key.slice(1)
              const active         = screen === key
              const currentAppIdx  = APP_SCREENS.indexOf(screen)
              const thisIdx        = APP_SCREENS.indexOf(key)
              const accessible     = thisIdx <= currentAppIdx
              return (
                <button key={key}
                  onClick={() => accessible && onNavigate(key)}
                  disabled={!accessible}
                  style={{
                    fontFamily: 'var(--font-mono)', fontSize: '10px',
                    letterSpacing: '0.3px', padding: '4px 10px',
                    background: 'none', border: 'none',
                    cursor: accessible ? 'pointer' : 'default',
                    color: active ? 'var(--text-0)' : accessible ? 'var(--text-2)' : 'var(--text-3)',
                    position: 'relative',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={e => { if (accessible && !active) e.currentTarget.style.color = 'var(--text-1)' }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.color = accessible ? 'var(--text-2)' : 'var(--text-3)' }}
                >
                  {accessible && !active && (
                    <span style={{ marginRight: '4px', color: 'var(--green)', fontSize: '8px' }}>✓</span>
                  )}
                  {label}
                  {active && (
                    <span style={{
                      position: 'absolute', bottom: '-1px',
                      left: '10px', right: '10px',
                      height: '1px', background: 'var(--text-0)',
                    }} />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </header>
  )
}

/* ─── ROOT APP ─────────────────────────────────────────────── */
export default function App() {
  const [screen, setScreen] = useState('landing')
  const [players, setPlayers] = useState([])
  const [playerData, setPlayerData] = useState({
    profile: null, simulation: null, valuation: null, report: null,
    teamWins: 38, salaryAsk: 20,
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  useEffect(() => { fetchPlayers().then(setPlayers) }, [])

  const handleEvaluate = async (playerName, teamWins, salaryAsk) => {
    setLoading(true)
    setError(null)
    sessionStorage.setItem('playerName', playerName)

    try {
      const profile = await fetchProfile(playerName)
      if (!profile) {
        setError('Player not found. Check spelling and try again.')
        setLoading(false)
        return
      }
      const mpg = profile.stats?.mp ?? 30
      const age = (profile.age && profile.age !== 'N/A') ? parseFloat(profile.age) : 0

      const sim = await runSimulation(profile.impact_score, teamWins, profile.gp, mpg)
      if (!sim) { setError('Simulation failed. Please try again.'); setLoading(false); return }

      const val = await calculateValue(sim.wins_added, salaryAsk, age, profile.gp, mpg)
      if (!val) { setError('Valuation failed. Please try again.'); setLoading(false); return }

      let rep = null
      try {
        rep = await generateReport({
          player:             profile.player,
          position:           profile.position,
          impact_score:       profile.impact_score,
          percentile:         profile.percentile,
          trend_signal:       profile.trend_signal,
          wins_added:         sim.wins_added,
          expected_wins:      sim.expected_wins,
          playoff_prob:       sim.playoff_prob,
          fair_value_m:       val.fair_value_m,
          efficiency_ratio:   val.efficiency_ratio,
          overpay_pct:        val.overpay_pct,
          decision:           val.decision,
          absence_reason:     val.absence_reason   ?? 'full',
          is_projected:       val.is_projected     ?? false,
          projected_wins:     val.projected_wins,
          requested_salary_m: salaryAsk,
          current_team_wins:  teamWins,
          gp:                 profile.gp,
          age:                profile.age,
          durability_score:   val.durability_score,
        })
      } catch { console.warn('Report generation failed, continuing without it.') }

      setPlayerData({ profile, simulation: sim, valuation: val, report: rep, teamWins, salaryAsk })
      setScreen('profile')
    } catch (err) {
      setError('Something went wrong. Please check your connection and try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const nav = s => setScreen(s)

  const isLanding = screen === 'landing'
  const isApp     = APP_SCREENS.includes(screen)
  const topPad    = isApp ? '92px' : '56px'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-0)' }}>
      <NavBar screen={screen} onNavigate={nav} />
      <div style={{ paddingTop: isLanding ? '56px' : topPad }}>
        {screen === 'landing'    && <LandingPage      onLaunch={() => nav('search')} onNavigate={nav} />}
        {screen === 'search'     && <SearchScreen     onEvaluate={handleEvaluate} loading={loading} error={error} />}
        {screen === 'profile'    && <ProfileScreen    data={playerData} onNext={() => nav('simulation')} onBack={() => nav('search')} />}
        {screen === 'simulation' && <SimulationScreen data={playerData} onNext={() => nav('decision')}   onBack={() => nav('profile')} />}
        {screen === 'decision'   && <DecisionScreen   data={playerData} onNext={() => nav('report')}     onBack={() => nav('simulation')} />}
        {screen === 'report'     && <ReportScreen     data={playerData} onBack={() => nav('decision')} />}
        {screen === 'trade'      && <TradeScreen      onBack={() => nav('search')} players={players} />}
        {screen === 'compare'    && <CompareScreen    onBack={() => nav('search')} players={players} />}
      </div>
    </div>
  )
}