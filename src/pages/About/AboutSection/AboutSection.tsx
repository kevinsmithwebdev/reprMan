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
    <>
      <Card.Subtitle style={{ padding: '10px 0' }}>
        {section.subtitle}
      </Card.Subtitle>
      {section.body.map((p: any) => (
        <Card.Text key={p}>{p.join(' ')}</Card.Text>
      ))}
    </>
  )
}

export default AboutSection
