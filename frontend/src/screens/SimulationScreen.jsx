import WinHistogram from '../components/WinHistogram'

export default function SimulationScreen({ data, onNext, onBack }) {
  const { profile, simulation, teamWins } = data
  if (!profile || !simulation) return null

  const {
    expected_wins, wins_added, playoff_prob,
    win_range_low, win_range_high, win_distribution,
  } = simulation

  const playoffColor = playoff_prob > 60 ? 'var(--green)'
                     : playoff_prob > 40 ? 'var(--amber)'
                     :                     'var(--red)'

  const statPanels = [
    {
      label: 'Expected Wins',
      value: `${teamWins} → ${expected_wins.toFixed(1)}`,
      sub:   `${wins_added.toFixed(1)} wins above baseline`,
      color: 'var(--text-0)',
    },
    {
      label: 'Wins Added',
      value: `+${wins_added.toFixed(1)}`,
      sub:   'vs. league-average team',
      color: wins_added > 0 ? 'var(--green)' : 'var(--red)',
    },
    {
      label: 'Playoff Probability',
      value: `${playoff_prob.toFixed(1)}%`,
      sub:   '≥ 41 wins threshold',
      color: playoffColor,
    },
  ]

  return (
    <main style={{ maxWidth: '1080px', margin: '0 auto', padding: '40px 24px 48px' }}
      className="fade-up">

      {/* ── Header ───────────────────────────────── */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '28px', fontWeight: 600,
          letterSpacing: '-0.6px', color: 'var(--text-0)',
          marginBottom: '6px',
        }}>
          Season Simulation
        </h2>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: '12px',
          color: 'var(--text-3)', letterSpacing: '0.2px',
        }}>
          Monte Carlo · {profile.player} · impact {profile.impact_score.toFixed(2)} · 10,000 iterations
        </p>
      </div>

      {/* ── Histogram panel ──────────────────────── */}
      <div style={{
        background: 'var(--bg-1)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)',
        padding: '24px',
        marginBottom: '1px',
      }}>
        {/* Panel header */}
        <div style={{
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', marginBottom: '24px',
          flexWrap: 'wrap', gap: '12px',
        }}>
          <div>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: '11px',
              color: 'var(--text-3)', letterSpacing: '0.3px',
              marginBottom: '3px',
            }}>
              Win distribution
            </p>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: '10px',
              color: 'var(--text-3)', opacity: 0.6,
            }}>
              90% confidence interval · {win_range_low}–{win_range_high} wins
            </p>
          </div>

          {/* Legend */}
          <div style={{
            display: 'flex', gap: '16px',
            fontFamily: 'var(--font-mono)', fontSize: '10px',
            color: 'var(--text-3)', alignItems: 'center',
          }}>
            {[
              { color: 'var(--text-3)', label: 'Current baseline' },
              { color: 'var(--text-1)', label: 'Expected wins' },
            ].map(({ color, label }) => (
              <span key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  width: '20px', height: '1px',
                  background: color, display: 'inline-block',
                  borderTop: `1px dashed ${color}`,
                }} />
                {label}
              </span>
            ))}
          </div>
        </div>

        <WinHistogram
          win_distribution={win_distribution}
          expected_wins={expected_wins}
          current_wins={teamWins}
        />
      </div>

      {/* ── Stat panels (gap-as-border) ───────────── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1px', background: 'var(--border)',
        borderRadius: 'var(--r-lg)', overflow: 'hidden',
        marginTop: '1px', marginBottom: '32px',
      }}>
        {statPanels.map(({ label, value, sub, color }) => (
          <div
            key={label}
            style={{
              background: 'var(--bg-1)', padding: '20px 24px',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-1)'}
          >
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: '10px',
              color: 'var(--text-3)', letterSpacing: '0.5px',
              marginBottom: '10px',
            }}>
              {label}
            </p>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: '26px',
              fontWeight: 600, letterSpacing: '-0.6px',
              color, marginBottom: '6px',
            }}>
              {value}
            </p>
            {sub && (
              <p style={{
                fontFamily: 'var(--font-mono)', fontSize: '11px',
                color: 'var(--text-3)',
              }}>
                {sub}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* ── Navigation ───────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={onBack} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'var(--font-mono)', fontSize: '12px',
          color: 'var(--text-3)', transition: 'color 0.15s ease',
          padding: '8px 0',
        }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-1)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
        >
          ← Back
        </button>

        <button onClick={onNext} style={{
          padding: '9px 20px',
          background: 'var(--text-0)', color: 'var(--bg-0)',
          border: 'none', borderRadius: 'var(--r-md)',
          fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500,
          cursor: 'pointer', letterSpacing: '-0.1px',
          transition: 'opacity 0.15s ease',
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          onMouseDown={e => e.currentTarget.style.opacity = '0.72'}
          onMouseUp={e => e.currentTarget.style.opacity = '0.88'}
        >
          Contract Decision →
        </button>
      </div>

    </main>
  )
}