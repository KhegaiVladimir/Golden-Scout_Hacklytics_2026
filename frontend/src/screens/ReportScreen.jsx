import ReportCard  from '../components/ReportCard'
import VoiceButton from '../components/VoiceButton'

export default function ReportScreen({ data, onBack }) {
  const { profile, report } = data
  if (!profile) return null

  return (
    <main style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 24px 48px' }}
      className="fade-up">

      {/* ── Header ───────────────────────────────── */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 600, letterSpacing: '-0.6px', color: 'var(--text-0)' }}>
            Executive Report
          </h2>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '10px',
            color: 'var(--text-3)', padding: '2px 8px',
            border: '1px solid var(--border)', borderRadius: 'var(--r-sm)',
            background: 'var(--bg-1)', letterSpacing: '0.3px',
          }}>
            Gemini 2.0 Flash
          </span>
        </div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-3)' }}>
          {profile.player}
        </p>
      </div>

      {/* ── Report card ──────────────────────────── */}
      <div style={{ marginBottom: '1px' }}>
        <ReportCard report={report} />
      </div>

      {/* ── Voice panel ──────────────────────────── */}
      <div style={{
        background: 'var(--bg-1)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)',
        padding: '32px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '32px',
      }}>
        <VoiceButton
          audioSummary={report?.audio_summary ?? ''}
          playerName={profile.player}
        />

        {report?.audio_summary && (
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: '11px',
            color: 'var(--text-2)', textAlign: 'center',
            lineHeight: 1.75, marginTop: '24px',
            maxWidth: '480px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border)',
          }}>
            {report.audio_summary}
          </p>
        )}
      </div>

      {/* ── Navigation ───────────────────────────── */}
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

    </main>
  )
}