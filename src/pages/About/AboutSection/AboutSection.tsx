import { useL10n } from 'modules/Localization'
import React, { FC } from 'react'
import { Card } from 'react-bootstrap'

interface AboutSectionProps {
  slug: string
}
const AboutSection: FC<AboutSectionProps> = ({ slug }) => {
  const { t } = useL10n()
  const section = t(slug, { returnObjects: true }) as any

  return (
    <div style={{ maxWidth: '700px' }}>
      <Card.Subtitle style={{ padding: '10px 0' }}>
        {section.subtitle}
      </Card.Subtitle>
      {section.body.map((p: any) => (
        <Card.Text key={p}>{p.join(' ')}</Card.Text>
      ))}
    </div>
  )
}

export default AboutSection
