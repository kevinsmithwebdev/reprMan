/* eslint-disable react/no-unescaped-entities */
import { MY_EMAIL } from 'constants/index'
import React from 'react'
import { Card } from 'react-bootstrap'
import { useL10n } from 'modules/Localization'
import AboutSection from './AboutSection'

const About = () => {
  const { t } = useL10n()
  return (
    <Card.Body>
      <Card.Title>{`${t('pages.about.title')} - ${t('brand.reprMan')} - ${t(
        'brand.repertoireManagement'
      )}`}</Card.Title>

      <AboutSection slug="pages.about.historySection" />

      <hr />

      <AboutSection slug="pages.about.instructionsSection" />

      <hr />

      <AboutSection slug="pages.about.futureSection" />

      <Card.Text>{t('pages.about.suggestions', { email: MY_EMAIL })}</Card.Text>
    </Card.Body>
  )
}

export default About
