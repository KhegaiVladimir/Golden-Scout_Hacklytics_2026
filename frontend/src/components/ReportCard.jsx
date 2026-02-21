const DECISION_COLOR = {
  SIGN:      { border: '#10B981', bg: 'rgba(16,185,129,0.06)'  },
  NEGOTIATE: { border: '#F59E0B', bg: 'rgba(245,158,11,0.06)'  },
  AVOID:     { border: '#EF4444', bg: 'rgba(239,68,68,0.06)'   },
}

function Section({ label, children, leftBorder, bg, delay }) {
  return (
    <div
      className={`rounded-xl p-4 ${delay}`}
      style={{
        background: bg || 'transparent',
        border: '1px solid #1c2333',
        borderLeft: leftBorder ? `3px solid ${leftBorder}` : undefined,
      }}
    >
      <p className="font-mono text-[10px] text-scout-muted uppercase tracking-[2px] mb-2">{label}</p>
      {children}
    </div>
  )
}

export default function ReportCard({ report }) {
  if (!report) return null
  const { verdict, strengths, concern, recommendation } = report
  const strengthItems = strengths?.split('|').map(s => s.trim()).filter(Boolean) ?? []
  const decision = recommendation?.split(' ')[0] ?? 'NEGOTIATE'
  const dCfg = DECISION_COLOR[decision] || DECISION_COLOR.NEGOTIATE

  return (
    <div className="space-y-3">
      <Section label="Verdict" leftBorder="#00C9E0" delay="fade-up-1">
        <p className="text-scout-text text-sm leading-relaxed">{verdict}</p>
      </Section>

      <Section label="Strengths" bg="rgba(16,185,129,0.04)" delay="fade-up-2">
        <ul className="space-y-1.5">
          {strengthItems.map((s, i) => (
            <li key={i} className="flex gap-2 text-sm items-start">
              <span className="text-scout-green mt-0.5 text-xs">+</span>
              <span className="text-scout-green/90">{s}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section label="Concern" bg="rgba(245,158,11,0.04)" delay="fade-up-3">
        <p className="text-scout-amber text-sm flex gap-2 items-start">
          <span className="mt-0.5 text-xs">!</span>
          {concern}
        </p>
      </Section>

      <Section label="Recommendation" leftBorder={dCfg.border} bg={dCfg.bg} delay="fade-up-4">
        <p className="font-mono text-sm text-scout-text font-medium">{recommendation}</p>
      </Section>
    </div>
  )
}