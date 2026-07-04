import { getServerTranslation } from '@reprman/localization/server'

type AboutSectionData = {
  subtitle: string
  body: string[][]
}

export const ServerAboutSection = async ({ slug }: { slug: string }) => {
  const { t } = await getServerTranslation()
  const section = t(slug, { returnObjects: true }) as AboutSectionData

  return (
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
}
