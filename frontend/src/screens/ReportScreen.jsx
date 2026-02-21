import ReportCard from '../components/ReportCard'
import VoiceButton from '../components/VoiceButton'

export default function ReportScreen({ data, onBack }) {
  const { profile, report } = data
  if (!profile) return null

  return (
    <main className="max-w-3xl mx-auto px-6 py-8 fade-up">

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-2xl font-bold text-scout-text">Executive Report</h2>
          <span className="font-mono text-[10px] text-scout-muted border border-scout-border rounded px-2 py-0.5">
            Powered by Gemini
          </span>
        </div>
        <p className="font-mono text-sm text-scout-muted">{profile.player}</p>
      </div>

      {/* Report sections */}
      <div className="mb-8">
        <ReportCard report={report} />
      </div>

      {/* Voice */}
      <div className="bg-scout-card rounded-xl border border-scout-border p-8 flex flex-col items-center mb-8">
        <VoiceButton
          audioSummary={report?.audio_summary ?? ''}
          playerName={profile.player}
        />
      </div>

      <button onClick={onBack}
        className="font-mono text-sm text-scout-muted hover:text-scout-text transition-colors">
        ← Back
      </button>
    </main>
  )
}