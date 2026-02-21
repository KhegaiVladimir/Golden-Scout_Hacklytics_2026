import PlayerRadarChart from '../components/RadarChart'
import StatTable        from '../components/StatTable'
import TrendBadge       from '../components/TrendBadge'

function MiniStat({ label, value, highlight }) {
  return (
    <div className="bg-scout-card border border-scout-border rounded-xl p-4 text-center">
      <p className="font-mono text-[10px] text-scout-muted uppercase tracking-[2px] mb-2">{label}</p>
      <p className={`font-mono text-2xl font-bold ${highlight ? 'text-scout-teal' : 'text-scout-text'}`}>
        {value}
      </p>
    </div>
  )
}

export default function ProfileScreen({ data, onNext, onBack }) {
  const { profile } = data
  if (!profile) return null

  return (
    <main className="max-w-6xl mx-auto px-6 py-8 fade-up">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <h2 className="text-4xl font-bold text-scout-text tracking-tight">{profile.player}</h2>
          <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-scout-teal/10 text-scout-teal border border-scout-teal/20">
            {profile.position}
          </span>
          {profile.team && (
            <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-scout-card2 text-scout-dim border border-scout-border">
              {profile.team}
            </span>
          )}
          <TrendBadge trend={profile.trend_signal} />
        </div>
        <p className="font-mono text-scout-gold text-sm">
          Impact score: <span className="font-bold">{profile.impact_score.toFixed(2)}</span>
          <span className="text-scout-muted mx-2">·</span>
          <span className="font-bold">{profile.percentile.toFixed(1)}th percentile</span>
          <span className="text-scout-muted mx-2">·</span>
          <span className="text-scout-dim">Salary: ${profile.salary_m}M</span>
        </p>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-5 gap-5 mb-5">

        {/* Radar */}
        <div className="col-span-2 bg-scout-card border border-scout-border rounded-2xl p-5 shadow-card">
          <p className="font-mono text-[10px] text-scout-muted uppercase tracking-[2px] mb-1">Performance Radar</p>
          <p className="font-mono text-[10px] text-scout-muted/50 mb-4">vs. position average</p>
          <PlayerRadarChart radar={profile.radar} />
        </div>

        {/* Stat table */}
        <div className="col-span-3 bg-scout-card border border-scout-border rounded-2xl p-5 shadow-card">
          <p className="font-mono text-[10px] text-scout-muted uppercase tracking-[2px] mb-1">Statistical Breakdown</p>
          <p className="font-mono text-[10px] text-scout-muted/50 mb-4">Position-adjusted z-scores</p>
          <StatTable profile={profile} />
        </div>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <MiniStat label="PPG"  value={profile.stats.pts} highlight />
        <MiniStat label="APG"  value={profile.stats.ast} />
        <MiniStat label="RPG"  value={profile.stats.reb} />
        <MiniStat label="GP"   value={profile.stats.gp}  />
      </div>

      {/* Nav */}
      <div className="flex justify-between items-center">
        <button onClick={onBack}
          className="font-mono text-sm text-scout-muted hover:text-scout-text transition-colors flex items-center gap-2">
          ← Back to Search
        </button>
        <button onClick={onNext}
          className="px-6 py-2.5 rounded-xl font-mono font-bold text-sm tracking-wider transition-all active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #00C9E0, #0099B8)', color: '#050810', boxShadow: '0 0 16px rgba(0,201,224,0.2)' }}
        >
          Season Simulation →
        </button>
      </div>
    </main>
  )
}
