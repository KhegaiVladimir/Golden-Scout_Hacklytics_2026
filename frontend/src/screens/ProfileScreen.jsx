import PlayerRadarChart from '../components/RadarChart'
import StatTable from '../components/StatTable'
import TrendBadge from '../components/TrendBadge'
import Skeleton, { SkeletonBlock } from '../components/Skeleton'

export default function ProfileScreen({ data, onNext, onBack }) {
  const { profile } = data
  if (!profile) return null

  return (
    <main className="max-w-5xl mx-auto px-6 py-8 fade-up">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-3xl font-bold text-scout-text">{profile.player}</h2>
            <span className="font-mono text-xs px-2 py-1 rounded bg-scout-teal/10 text-scout-teal border border-scout-teal/30">
              {profile.position}
            </span>
            <TrendBadge trend={profile.trend_signal} />
          </div>
          <p className="font-mono text-scout-gold text-sm">
            Impact: {profile.impact_score.toFixed(2)} —{' '}
            <span>{profile.percentile.toFixed(1)}th percentile</span>
            {profile.team && <span className="text-scout-muted ml-2">· {profile.team}</span>}
          </p>
        </div>
      </div>

      {/* Small sample warning */}
      {profile.small_sample && (
        <div className="bg-amber-900/30 border border-amber-500/50 rounded-lg px-4 py-2 mb-4 flex items-center gap-2">
          <span className="text-amber-400 text-sm">⚠️</span>
          <span className="font-mono text-xs text-amber-400">
            Small Sample Size — {profile.warnings?.[0] ?? `${profile.gp} games played — stats may be unreliable`}
          </span>
        </div>
      )}

      {/* Radar + Stat Table */}
      <div className="grid grid-cols-5 gap-6 mb-6">
        <div className="col-span-2 bg-scout-card rounded-xl border border-scout-border p-5">
          <p className="font-mono text-[10px] text-scout-muted uppercase tracking-widest mb-3">Performance Radar</p>
          <PlayerRadarChart radar={profile.radar} />
        </div>
        <div className="col-span-3 bg-scout-card rounded-xl border border-scout-border p-5">
          <p className="font-mono text-[10px] text-scout-muted uppercase tracking-widest mb-3">Statistical Breakdown</p>
          <StatTable profile={profile} />
        </div>
      </div>

      {/* Mini stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'PPG',  value: profile.stats.pts },
          { label: 'APG',  value: profile.stats.ast },
          { label: 'RPG',  value: profile.stats.reb },
          { label: 'GP',   value: profile.stats.gp  },
        ].map(({ label, value }) => (
          <div key={label} className="bg-scout-card rounded-xl border border-scout-border p-4 text-center">
            <p className="font-mono text-[10px] text-scout-muted uppercase tracking-widest mb-1">{label}</p>
            <p className="font-mono text-2xl font-bold text-scout-text">{value}</p>
          </div>
        ))}
      </div>

      {/* Nav */}
      <div className="flex justify-between">
        <button onClick={onBack}
          className="font-mono text-sm text-scout-muted hover:text-scout-text transition-colors">
          ← Back
        </button>
        <button onClick={onNext}
          className="px-6 py-2.5 bg-scout-teal text-scout-bg font-mono font-bold text-sm tracking-wider rounded-lg hover:bg-scout-teal/90 transition-all">
          Next: Season Simulation →
        </button>
      </div>
    </main>
  )
}