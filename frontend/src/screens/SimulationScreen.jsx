import WinHistogram from '../components/WinHistogram'

export default function SimulationScreen({ data, onNext, onBack }) {
  const { profile, simulation, teamWins } = data
  if (!profile || !simulation) return null

  const { expected_wins, wins_added, playoff_prob, win_range_low, win_range_high, win_distribution } = simulation

  const playoffColor = playoff_prob > 60 ? 'text-green-400' : playoff_prob > 40 ? 'text-amber-400' : 'text-red-400'

  return (
    <main className="max-w-5xl mx-auto px-6 py-8 fade-up">

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-scout-text">10,000 Simulated Seasons</h2>
        <p className="font-mono text-sm text-scout-muted mt-1">
          Monte Carlo analysis — {profile.player} (impact: {profile.impact_score.toFixed(2)})
        </p>
      </div>

      {/* Histogram */}
      <div className="bg-scout-card rounded-xl border border-scout-border p-5 mb-6">
        <p className="font-mono text-[10px] text-scout-muted uppercase tracking-widest mb-4">Win Distribution</p>
        <WinHistogram
          win_distribution={win_distribution}
          expected_wins={expected_wins}
          current_wins={teamWins}
        />
        <p className="font-mono text-[10px] text-scout-muted text-center mt-2">
          90% confidence interval: {win_range_low}–{win_range_high} wins
        </p>
      </div>

      {/* Stat boxes */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-scout-card rounded-xl border border-scout-border p-5 text-center">
          <p className="font-mono text-[10px] text-scout-muted uppercase tracking-widest mb-2">Expected Wins</p>
          <p className="font-mono text-3xl font-bold text-scout-teal">
            {teamWins} → {expected_wins.toFixed(1)}
          </p>
        </div>
        <div className="bg-scout-card rounded-xl border border-scout-border p-5 text-center">
          <p className="font-mono text-[10px] text-scout-muted uppercase tracking-widest mb-2">Wins Added</p>
          <p className="font-mono text-3xl font-bold text-scout-gold">+{wins_added.toFixed(1)}</p>
        </div>
        <div className="bg-scout-card rounded-xl border border-scout-border p-5 text-center">
          <p className="font-mono text-[10px] text-scout-muted uppercase tracking-widest mb-2">Playoff Probability</p>
          <p className={`font-mono text-3xl font-bold ${playoffColor}`}>{playoff_prob.toFixed(1)}%</p>
        </div>
      </div>

      <div className="flex justify-between">
        <button onClick={onBack}
          className="font-mono text-sm text-scout-muted hover:text-scout-text transition-colors">
          ← Back
        </button>
        <button onClick={onNext}
          className="px-6 py-2.5 bg-scout-teal text-scout-bg font-mono font-bold text-sm tracking-wider rounded-lg hover:bg-scout-teal/90 transition-all">
          Next: Contract Decision →
        </button>
      </div>
    </main>
  )
}