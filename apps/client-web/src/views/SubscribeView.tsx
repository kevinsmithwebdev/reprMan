'use client'

import React, { useState } from 'react'
import { useAuthGate } from '@reprman/cognito-auth'
import { isReprsApiConfigured, ReprsApiModule } from '@reprman/reprs-api'
import { useL10n } from '@reprman/localization'
import { Card, Button, Spinner } from 'react-bootstrap'
import { useReplaceWhen } from '../hooks/useReplaceWhen'

const SubscribeView = () => {
  const { t } = useL10n()
  const { isSignedOut } = useAuthGate()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useReplaceWhen(isSignedOut, '/signin')

  if (isSignedOut) {
    return null
  }

  const handleSubscribe = async () => {
    if (!isReprsApiConfigured) {
      setError(t('billing.checkoutUnavailable'))
      return
    }
    setBusy(true)
    setError(null)
    try {
      const { url } = await ReprsApiModule.getInstance().createCheckoutSession()
      globalThis.location.assign(url)
    } catch {
      setError(t('billing.checkoutFailed'))
      setBusy(false)
    }
  }

  return (
    <Card.Body className="app-page-padded" id="Subscribe-page">
      <Card.Title>{t('pages.subscribe.title')}</Card.Title>
      <Card.Text>{t('pages.subscribe.body')}</Card.Text>
      <p className="fw-semibold">{t('pages.subscribe.price')}</p>
      {error ? <Card.Text className="text-danger">{error}</Card.Text> : null}
      <Button
        variant="primary"
        disabled={busy}
        onClick={() => handleSubscribe()}
      >
        {busy ? (
          <Spinner animation="border" size="sm" className="me-1" />
        ) : null}
        {t('billing.subscribe')}
      </Button>
    </Card.Body>
  )
}

export default SubscribeView
