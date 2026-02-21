import { useNavigate, useLocation } from 'react-router-dom'

const STEPS = [
  { path: '/profile',    label: '01 · Profile' },
  { path: '/simulation', label: '02 · Simulation' },
  { path: '/decision',   label: '03 · Decision' },
  { path: '/report',     label: '04 · Report' },
]

export default function NavBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const player   = sessionStorage.getItem('playerName')

  return (
    <header className="sticky top-0 z-50 border-b border-gs-border bg-gs-surface/90 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">

        <button
          onClick={() => navigate('/')}
          className="font-display font-black text-xl text-gs-white tracking-tight hover:text-gs-accent transition-colors"
        >
          GOLDEN<span className="text-gs-accent">SCOUT</span>
        </button>

        <div className="flex items-center">
          {STEPS.map(step => {
            const active = location.pathname === step.path
            return (
              <button
                key={step.path}
                onClick={() => navigate(step.path)}
                className={`px-4 py-[18px] font-mono text-xs tracking-wider border-b-2 -mb-px transition-all
                  ${active
                    ? 'text-gs-accent border-gs-accent'
                    : 'text-gs-muted border-transparent hover:text-gs-white'
                  }`}
              >
                {step.label}
              </button>
            )
          })}
        </div>

        <span className="font-mono text-xs text-gs-muted">{player || '—'}</span>
      </div>
    </header>
  )
}