import PlayerRadarChart from '../components/RadarChart'
import StatTable        from '../components/StatTable'
import TrendBadge       from '../components/TrendBadge'

export default function ProfileScreen({ data, onNext, onBack }) {
  const { profile } = data
  if (!profile) return null

  const stats = [
    { label: 'PPG', value: profile.stats.pts },
    { label: 'APG', value: profile.stats.ast },
    { label: 'RPG', value: profile.stats.reb },
    { label: 'GP',  value: profile.stats.gp  },
  ]

  return (
    <main style={{ maxWidth: '1080px', margin: '0 auto', padding: '40px 24px 48px' }}
      className="fade-up">

      {/* ── Player header ─────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between', marginBottom: '32px',
        flexWrap: 'wrap', gap: '16px',
      }}>
        <div>
          {/* Name row */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
            <h2 style={{
              fontSize: '32px', fontWeight: 600,
              letterSpacing: '-0.8px', color: 'var(--text-0)',
            }}>
              {profile.player}
            </h2>
            {/* Position tag */}
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '11px',
              color: 'var(--text-2)', padding: '2px 8px',
              border: '1px solid var(--border)', borderRadius: 'var(--r-sm)',
            }}>
              {profile.position}
            </span>
            {/* Team tag */}
            {profile.team && (
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '11px',
                color: 'var(--text-2)', padding: '2px 8px',
                border: '1px solid var(--border)', borderRadius: 'var(--r-sm)',
              }}>
                {profile.team}
              </span>
            )}
            <TrendBadge trend={profile.trend_signal} />
          </div>

          {/* Meta row */}
          <div style={{
            display: 'flex', gap: '16px', flexWrap: 'wrap',
            fontFamily: 'var(--font-mono)', fontSize: '12px',
            color: 'var(--text-2)',
          }}>
            <span>
              Impact <span style={{ color: 'var(--text-0)', fontWeight: 600 }}>
                {profile.impact_score.toFixed(2)}
              </span>
            </span>
            <span style={{ color: 'var(--text-3)' }}>·</span>
            <span>
              <span style={{ color: 'var(--text-0)', fontWeight: 600 }}>
                {profile.percentile.toFixed(1)}th
              </span> percentile
            </span>
            <span style={{ color: 'var(--text-3)' }}>·</span>
            <span>Salary <span style={{ color: 'var(--text-0)', fontWeight: 600 }}>
              ${profile.salary_m}M
            </span></span>
          </div>
        </div>

        {/* Age badge */}
        {profile.age && profile.age !== 'N/A' && (
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '11px',
            color: 'var(--text-2)', padding: '6px 12px',
            border: '1px solid var(--border)', borderRadius: 'var(--r-sm)',
            background: 'var(--bg-1)', alignSelf: 'flex-start',
          }}>
            Age {profile.age}
          </div>
        )}
      </div>

      {/* ── Radar + Stat table ────────────────────── */}
      <div style={{
        display: 'grid', gridTemplateColumns: '2fr 3fr',
        gap: '1px', background: 'var(--border)',
        borderRadius: 'var(--r-lg)', overflow: 'hidden',
        marginBottom: '1px',
      }}>
        {/* Radar */}
        <div style={{ background: 'var(--bg-1)', padding: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: '11px',
              color: 'var(--text-3)', letterSpacing: '0.3px',
              marginBottom: '2px',
            }}>Performance radar</p>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: '10px',
              color: 'var(--text-3)', opacity: 0.6,
            }}>vs. position average</p>
          </div>
          <PlayerRadarChart radar={profile.radar} />
        </div>

        {/* Stat table */}
        <div style={{ background: 'var(--bg-1)', padding: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: '11px',
              color: 'var(--text-3)', letterSpacing: '0.3px',
              marginBottom: '2px',
            }}>Statistical breakdown</p>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: '10px',
              color: 'var(--text-3)', opacity: 0.6,
            }}>Position-adjusted z-scores</p>
          </div>
          <StatTable profile={profile} />
        </div>
      </div>

      {/* ── Mini stats strip (gap-as-border) ─────── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1px', background: 'var(--border)',
        borderRadius: 'var(--r-lg)', overflow: 'hidden',
        marginBottom: '32px',
      }}>
        {stats.map(({ label, value }) => (
          <div key={label} style={{
            background: 'var(--bg-1)', padding: '20px 24px',
            transition: 'background 0.15s ease',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-1)'}
          >
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: '10px',
              color: 'var(--text-3)', letterSpacing: '0.5px',
              marginBottom: '8px',
            }}>
              {label}
            </p>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: '28px',
              fontWeight: 600, letterSpacing: '-0.8px',
              color: 'var(--text-0)',
            }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Navigation ───────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={onBack} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'var(--font-mono)', fontSize: '12px',
          color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: '6px',
          transition: 'color 0.15s ease', padding: '8px 0',
        }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-1)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
        >
          ← Search
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
          Season Simulation →
        </button>
      </div>

    </main>
  )
}