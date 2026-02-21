const DECISION_BORDER = {
  SIGN:      'border-green-500',
  NEGOTIATE: 'border-amber-500',
  AVOID:     'border-red-500',
}

function Section({ className = '', label, children, delay = 'fade-up-1' }) {
  return (
    <div className={`rounded-xl border border-scout-border p-4 ${className} ${delay}`}>
      <p className="font-mono text-[10px] text-scout-muted uppercase tracking-widest mb-2">{label}</p>
      {children}
    </div>
  )
}

export default function ReportCard({ report }) {
  if (!report) return null

  const { verdict, strengths, concern, recommendation, audio_summary } = report
  const strengthItems = strengths?.split('|').map(s => s.trim()).filter(Boolean) ?? []
  const decision = recommendation?.split(' ')[0] ?? 'NEGOTIATE'
  const decisionBorder = DECISION_BORDER[decision] || DECISION_BORDER.NEGOTIATE

  return (
    <div className="space-y-3">
      <Section label="Verdict" className="border-l-4 border-scout-teal" delay="fade-up-1">
        <p className="text-scout-text text-sm leading-relaxed">{verdict}</p>
      </Section>

      <Section label="Strengths" className="bg-green-900/10" delay="fade-up-2">
        <ul className="space-y-1">
          {strengthItems.map((s, i) => (
            <li key={i} className="flex gap-2 text-sm text-green-300">
              <span className="text-green-500 mt-0.5">+</span>
              {s}
            </li>
          ))}
        </ul>
      </Section>

      <Section label="Concern" className="bg-amber-900/10" delay="fade-up-3">
        <p className="text-amber-300 text-sm flex gap-2">
          <span className="text-amber-500">!</span>
          {concern}
        </p>
      </Section>

      <Section label="Recommendation" className={`border-l-4 ${decisionBorder}`} delay="fade-up-4">
        <p className="font-mono text-sm text-scout-text font-medium">{recommendation}</p>
      </Section>
    </div>
  )
}