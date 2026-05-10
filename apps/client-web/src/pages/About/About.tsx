/* eslint-disable react/no-unescaped-entities */
import { MY_EMAIL } from '@reprman/constants'
import React from 'react'
import { Card } from 'react-bootstrap'
import { useL10n } from '@reprman/localization'
import AboutSection from './AboutSection'

const About = () => {
  const { t } = useL10n()
  return (
    <Card.Body style={{ padding: '10px' }} id="About-page">
      <Card.Title>{`${t('pages.about.title')} - ${t('brand.reprMan')} - ${t(
        'brand.repertoireManagement'
      )}`}</Card.Title>

      <img
        src="/static/repr.jpg"
        alt="repr.jpg"
        style={{
          maxWidth: '100%',
          height: 'auto',
          display: 'block',
          marginTop: '20px',
          marginBottom: '12px',
        }}
      />

      <AboutSection slug="pages.about.historySection" />

      <hr />

      <AboutSection slug="pages.about.instructionsSection" />

      <hr />

      <AboutSection slug="pages.about.futureSection" />

      <ul>
        <li>accounts</li>
        <li>mobile versions</li>
        <li>sharing</li>
        <li>similar feature for things like scales, etc.</li>
        <li>dark mode</li>
      </ul>

      <Card.Text>{t('pages.about.suggestions', { email: MY_EMAIL })}</Card.Text>
    </Card.Body>
  )
}

export default About
