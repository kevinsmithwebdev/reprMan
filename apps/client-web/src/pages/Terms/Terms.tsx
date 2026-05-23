import React from 'react'
import { Card } from 'react-bootstrap'
import { useL10n } from '@reprman/localization'
import TermsSection from './TermsSection'

const TERMS_SECTIONS = [
  'pages.terms.purposeSection',
  'pages.terms.conductSection',
  'pages.terms.inactivitySection',
  'pages.terms.emailUseSection',
  'pages.terms.emailVolumeSection',
  'pages.terms.agreementSection',
] as const

const Terms = () => {
  const { t } = useL10n()
  return (
    <Card.Body className="app-page-padded" id="Terms-page">
      <Card.Title>{t('pages.terms.title')}</Card.Title>

      {TERMS_SECTIONS.map((slug, index) => (
        <React.Fragment key={slug}>
          {index > 0 ? <hr /> : null}
          <TermsSection slug={slug} />
        </React.Fragment>
      ))}
    </Card.Body>
  )
}

export default Terms
