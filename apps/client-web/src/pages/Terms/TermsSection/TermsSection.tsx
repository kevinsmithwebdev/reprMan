import { useL10n } from '@reprman/localization'
import React, { FC } from 'react'
import { Card } from 'react-bootstrap'

interface TermsSectionProps {
  slug: string
}

const TermsSection: FC<TermsSectionProps> = ({ slug }) => {
  const { t } = useL10n()
  const section = t(slug, { returnObjects: true }) as {
    subtitle: string
    body: string[][]
  }

  return (
    <div style={{ maxWidth: '700px' }}>
      <Card.Subtitle style={{ padding: '10px 0' }}>
        {section.subtitle}
      </Card.Subtitle>
      {section.body.map((paragraph) => (
        <Card.Text key={paragraph.join(' ')}>{paragraph.join(' ')}</Card.Text>
      ))}
    </div>
  )
}

export default TermsSection
