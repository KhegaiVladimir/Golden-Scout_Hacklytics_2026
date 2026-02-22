// ReportCard.jsx
const VERDICT_COLOR = {
  SIGN:      { color: 'var(--green)', subtle: 'var(--green-subtle)', border: 'var(--green-border)' },
  NEGOTIATE: { color: 'var(--amber)', subtle: 'var(--amber-subtle)', border: 'var(--amber-border)' },
  AVOID:     { color: 'var(--red)',   subtle: 'var(--red-subtle)',   border: 'var(--red-border)'   },
}

export default function ReportCard({ report }) {
  if (!report) return null
  const { verdict, strengths, concern, recommendation } = report
  const strengthItems = strengths?.split('|').map(s => s.trim()).filter(Boolean) ?? []
  const decision = recommendation?.split(' ')[0] ?? 'NEGOTIATE'
  const dCfg = VERDICT_COLOR[decision] || VERDICT_COLOR.NEGOTIATE

  return (
    <div style={{
      background: 'var(--bg-1)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-lg)',
      overflow: 'hidden',
    }}>

      {/* Verdict */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}
        className="fade-up-1">
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-3)', letterSpacing: '0.5px', marginBottom: '10px' }}>
          Verdict
        </p>
        <p style={{ fontSize: '13px', color: 'var(--text-1)', lineHeight: 1.7, letterSpacing: '-0.1px' }}>
          {verdict}
        </p>
      </div>

      {/* Strengths */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', background: 'var(--green-subtle)' }}
        className="fade-up-2">
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-3)', letterSpacing: '0.5px', marginBottom: '12px' }}>
          Strengths
        </p>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {strengthItems.map((s, i) => (
            <li key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--green)', fontFamily: 'var(--font-mono)', fontSize: '11px', marginTop: '2px', flexShrink: 0 }}>+</span>
              <span style={{ fontSize: '13px', color: 'var(--text-1)', lineHeight: 1.65, letterSpacing: '-0.1px' }}>{s}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Concern */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', background: 'var(--amber-subtle)' }}
        className="fade-up-3">
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-3)', letterSpacing: '0.5px', marginBottom: '10px' }}>
          Concern
        </p>
        <p style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '13px', color: 'var(--text-1)', lineHeight: 1.65, letterSpacing: '-0.1px' }}>
          <span style={{ color: 'var(--amber)', fontFamily: 'var(--font-mono)', fontSize: '11px', marginTop: '2px', flexShrink: 0 }}>!</span>
          {concern}
        </p>
      </div>

      {/* Recommendation */}
      <div style={{
        padding: '20px 24px',
        background: dCfg.subtle,
        borderTop: `1px solid ${dCfg.border}`,
      }}
        className="fade-up-4">
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-3)', letterSpacing: '0.5px', marginBottom: '10px' }}>
          Recommendation
        </p>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: dCfg.color, fontWeight: 600, letterSpacing: '-0.1px' }}>
          {recommendation}
        </p>
      </div>

    </div>
  )
}