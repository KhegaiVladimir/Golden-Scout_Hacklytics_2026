import ReportCard from '../components/ReportCard'
import VoiceButton from '../components/VoiceButton'

export default function ReportScreen({ data, onBack }) {
  const { profile, report } = data
  if (!profile) return null

  return (
    <main className="max-w-3xl mx-auto px-6 py-8 fade-up">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-3xl font-bold text-scout-text">Executive Report</h2>
          <span className="font-mono text-[10px] text-scout-muted border border-scout-border rounded-lg px-2.5 py-1 bg-scout-card">
            Powered by Gemini
          </span>
        </div>
        <p className="font-mono text-sm text-scout-muted">{profile.player}</p>
      </div>

      <div className="mb-6">
        <ReportCard report={report} />
      </div>

      <div className="bg-scout-card border border-scout-border rounded-2xl p-8 flex flex-col items-center mb-8 shadow-card">
        <VoiceButton
          audioSummary={report?.audio_summary ?? ''}
          playerName={profile.player}
        />

        {/* Текст для тех кто не хочет слушать */}
        {report?.audio_summary && (
          <p className="font-mono text-[11px] text-scout-muted text-center leading-relaxed mt-6 max-w-md border-t border-scout-border/40 pt-5">
            {report.audio_summary}
          </p>
        )}
      </div>

      <button onClick={onBack}
        className="font-mono text-sm text-scout-muted hover:text-scout-text transition-colors">
        ← Back
      </button>
    </main>
  )
}