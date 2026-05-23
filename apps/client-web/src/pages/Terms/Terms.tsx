import React from 'react'
import { Card } from 'react-bootstrap'
import { TermsContent } from '@reprman/components'
import { useL10n } from '@reprman/localization'

const Terms = () => {
  const { t } = useL10n()
  return (
    <Card.Body className="app-page-padded" id="Terms-page">
      <Card.Title>{t('pages.terms.title')}</Card.Title>
      <TermsContent />
    </Card.Body>
  )
}

export default Terms
