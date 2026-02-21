const ReportCard = ({ report }) => {
  if (!report) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">No report available</p>
      </div>
    )
  }

  // Simple markdown-like parsing for sections
  const parseReport = (text) => {
    const sections = []
    const lines = text.split('\n')
    let currentSection = { title: '', content: [] }

    lines.forEach((line) => {
      if (line.startsWith('# ')) {
        if (currentSection.title) {
          sections.push(currentSection)
        }
        currentSection = { title: line.substring(2), content: [] }
      } else if (line.startsWith('## ')) {
        if (currentSection.title) {
          sections.push(currentSection)
        }
        currentSection = { title: line.substring(3), content: [] }
      } else if (line.trim()) {
        currentSection.content.push(line.trim())
      }
    })

    if (currentSection.title) {
      sections.push(currentSection)
    }

    return sections
  }

  const sections = parseReport(report)

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">AI Scouting Report</h2>
      <div className="prose max-w-none">
        {sections.map((section, idx) => (
          <div key={idx} className="mb-6">
            <h3 className="text-xl font-semibold mb-2">{section.title}</h3>
            <div className="text-gray-700 space-y-2">
              {section.content.map((paragraph, pIdx) => (
                <p key={pIdx}>{paragraph}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ReportCard
