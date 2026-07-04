'use client'

import React from 'react'
import Link from 'next/link'
import { Button, Card, Form, Spinner } from 'react-bootstrap'
import { useL10n } from '@reprman/localization'

interface ForgotPasswordRequestStepProps {
  email: string
  setEmail: (v: string) => void
  busy: boolean
  onSubmit: (e: React.FormEvent) => void
}

const ForgotPasswordRequestStep = ({
  email,
  setEmail,
  busy,
  onSubmit,
}: ForgotPasswordRequestStepProps) => {
  const { t } = useL10n()
  return (
    <>
      <Card.Text className="text-muted small mb-3">
        {t('pages.forgotPassword.subtitle')}
      </Card.Text>
      <Form onSubmit={onSubmit}>
        <Form.Group className="mb-3" controlId="forgot-email">
          <Form.Label>{t('auth.email')}</Form.Label>
          <Form.Control
            type="email"
            autoComplete="email"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            required
            disabled={busy}
          />
        </Form.Group>
        <div className="d-flex flex-wrap gap-2 align-items-center mt-3">
          <Button variant="primary" type="submit" disabled={busy}>
            {busy ? (
              <Spinner
                animation="border"
                size="sm"
                className="me-1"
                role="status"
              />
            ) : null}
            {t('auth.forgotPasswordSendCode')}
          </Button>
          <Link href="/signin" className="small">
            {t('auth.signIn')}
          </Link>
          <Link href="/" className="small">
            {t('auth.signUpBackHome')}
          </Link>
        </div>
      </Form>
    </>
  )
}

export default ForgotPasswordRequestStep
