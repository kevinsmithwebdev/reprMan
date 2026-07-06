export type TermsSectionData = {
  subtitle: string
  body: string[][]
}

export const ServerTermsSection = ({
  section,
}: {
  section: TermsSectionData
}) => (
  <div style={{ maxWidth: '700px' }}>
    <h2 className="card-subtitle h6" style={{ padding: '10px 0' }}>
      {section.subtitle}
    </h2>
    {section.body.map((paragraph) => (
      <p className="card-text" key={paragraph.join(' ')}>
        {paragraph.join(' ')}
      </p>
    ))}
  </div>
)
