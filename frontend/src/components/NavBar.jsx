// NavBar.jsx — standalone component version (for if/when routing is added)
// Currently NavBar lives in App.jsx; this file can replace it or be used with react-router.

const STEPS = ['Profile', 'Simulation', 'Decision', 'Report']
const STEP_SCREENS = ['profile', 'simulation', 'decision', 'report']

export default function NavBar({ screen, onNavigate }) {
  const currentIdx      = STEP_SCREENS.indexOf(screen)
  const isTradeScreen   = screen === 'trade'
  const isCompareScreen = screen === 'compare'
  const isSideScreen    = isTradeScreen || isCompareScreen

  if (currentIdx === -1 && !isSideScreen) return null

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      borderBottom: '1px solid var(--border)',
      background: 'rgba(9,9,9,0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
    }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Logo */}
        <button onClick={() => onNavigate('search')} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-0)', fontWeight: 600, fontSize: '14px', letterSpacing: '-0.2px',
        }}>
          <span style={{
            width: '22px', height: '22px', borderRadius: '5px',
            background: 'linear-gradient(135deg, #FAFAFA 0%, #888 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 600, color: 'var(--bg-0)',
          }}>GS</span>
          Golden Scout
        </button>

        {/* Center */}
        {isSideScreen ? (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-2)', padding: '3px 10px', border: '1px solid var(--border)', borderRadius: '999px', letterSpacing: '0.3px' }}>
            {isTradeScreen ? 'Trade Simulator' : 'Player Comparison'}
          </span>
        ) : (
          <nav style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            {STEPS.map((step, i) => {
              const done = i < currentIdx, active = i === currentIdx
              return (
                <button key={step} onClick={() => done && onNavigate(STEP_SCREENS[i])} disabled={!done && !active} style={{
                  position: 'relative', padding: '6px 12px',
                  background: 'none', border: 'none', borderRadius: 'var(--r-sm)',
                  cursor: done ? 'pointer' : 'default',
                  fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.5px',
                  color: active ? 'var(--text-0)' : done ? 'var(--text-2)' : 'var(--text-3)',
                  transition: 'color 0.15s ease',
                }}
                  onMouseEnter={e => { if (done) e.currentTarget.style.color = 'var(--text-1)' }}
                  onMouseLeave={e => { if (done) e.currentTarget.style.color = 'var(--text-2)' }}
                >
                  {done && <span style={{ marginRight: '4px', color: 'var(--green)', fontSize: '9px' }}>✓</span>}
                  {step}
                  {active && <span style={{ position: 'absolute', bottom: 0, left: '12px', right: '12px', height: '1px', background: 'var(--text-0)', borderRadius: '999px' }} />}
                  {i < STEPS.length - 1 && <span style={{ position: 'absolute', right: '-1px', color: 'var(--text-3)', fontSize: '12px', fontWeight: 300, pointerEvents: 'none' }}>›</span>}
                </button>
              )
            })}
          </nav>
        )}

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {['Compare', 'Trade'].map(label => {
            const key = label === 'Trade' ? 'trade' : 'compare'
            const active = screen === key
            return (
              <button key={label} onClick={() => onNavigate(key)} style={{
                fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.3px',
                padding: '5px 10px',
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
          {screen !== 'search' && screen !== 'trade' && screen !== 'compare' && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-3)', marginLeft: '8px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {sessionStorage.getItem('playerName')}
            </span>
          )}
        </div>

      </div>
    </header>
  )
}