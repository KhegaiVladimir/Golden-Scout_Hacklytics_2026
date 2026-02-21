import WinHistogram from '../components/WinHistogram'

function StatBox({ label, value, sub, color = 'text-scout-text' }) {
  return (
    <div className="bg-scout-card border border-scout-border rounded-2xl p-5 shadow-card">
      <p className="font-mono text-[10px] text-scout-muted uppercase tracking-[2px] mb-3">{label}</p>
      <p className={`font-mono text-3xl font-bold ${color}`}>{value}</p>
      {sub && <p className="font-mono text-xs text-scout-muted mt-2">{sub}</p>}
    </div>
  )
}

export default function SimulationScreen({ data, onNext, onBack }) {
  const { profile, simulation, teamWins } = data
  if (!profile || !simulation) return null

  const { expected_wins, wins_added, playoff_prob, win_range_low, win_range_high, win_distribution } = simulation
  const playoffColor = playoff_prob > 60 ? 'text-scout-green' : playoff_prob > 40 ? 'text-scout-amber' : 'text-scout-red'

  return (
    <main className="max-w-6xl mx-auto px-6 py-8 fade-up">

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-scout-text mb-1">Season Simulation</h2>
        <p className="font-mono text-sm text-scout-muted">
          Monte Carlo · {profile.player} · impact {profile.impact_score.toFixed(2)} · 10,000 iterations
        </p>
      </div>

      {/* Histogram */}
      <div className="bg-scout-card border border-scout-border rounded-2xl p-6 mb-5 shadow-card">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="font-mono text-[10px] text-scout-muted uppercase tracking-[2px]">Win Distribution</p>
            <p className="font-mono text-[10px] text-scout-muted/50 mt-0.5">
              90% confidence: {win_range_low}–{win_range_high} wins
            </p>
          </div>
          <div className="flex items-center gap-4 font-mono text-[10px] text-scout-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-scout-red/70 inline-block" style={{ borderTop: '2px dashed' }} />
              Current
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-scout-gold inline-block" style={{ borderTop: '2px dashed' }} />
              Expected
            </span>
          </div>
        </div>
        <WinHistogram
          win_distribution={win_distribution}
          expected_wins={expected_wins}
          current_wins={teamWins}
        />
      </div>

      {/* Stat boxes */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatBox
          label="Expected Wins"
          value={`${teamWins} → ${expected_wins.toFixed(1)}`}
          sub={`${wins_added.toFixed(1)} wins above baseline`}
          color="text-scout-teal"
        />
        <StatBox
          label="Wins Added"
          value={`+${wins_added.toFixed(1)}`}
          sub="vs. league-average team"
          color="text-scout-gold"
        />
        <StatBox
          label="Playoff Probability"
          value={`${playoff_prob.toFixed(1)}%`}
          sub="≥ 41 wins threshold"
          color={playoffColor}
        />
      </div>

      <div className="flex justify-between items-center">
        <button onClick={onBack}
          className="font-mono text-sm text-scout-muted hover:text-scout-text transition-colors">
          ← Back
        </button>
        <button onClick={onNext}
          className="px-6 py-2.5 rounded-xl font-mono font-bold text-sm tracking-wider transition-all active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #00C9E0, #0099B8)', color: '#050810', boxShadow: '0 0 16px rgba(0,201,224,0.2)' }}
        >
          Contract Decision →
        </button>
      </div>
    </main>
  )
}