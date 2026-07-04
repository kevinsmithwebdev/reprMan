'use client'

import React from 'react'
import { Button, Form, Spinner } from 'react-bootstrap'
import { useL10n } from '@reprman/localization'

interface SignupConfirmStepProps {
  email: string
  code: string
  setCode: (v: string) => void
  busy: boolean
  onSubmit: (e: React.FormEvent) => void
  onResend: () => void
  onEditEmail: () => void
}

const SignupConfirmStep = ({
  email,
  code,
  setCode,
  busy,
  onSubmit,
  onResend,
  onEditEmail,
}: SignupConfirmStepProps) => {
  const { t } = useL10n()
  return (
    <Form onSubmit={onSubmit}>
      <p>{t('auth.signUpConfirmIntro', { email: email.trim() })}</p>
      <Form.Group className="mb-3" controlId="signup-code">
        <Form.Label>{t('auth.confirmationCode')}</Form.Label>
        <Form.Control
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          value={code}
          onChange={(ev) => setCode(ev.target.value)}
          required
          disabled={busy}
        />
      </Form.Group>
      <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
        <Button variant="primary" type="submit" disabled={busy}>
          {busy ? (
            <Spinner animation="border" size="sm" className="me-1" />
          ) : null}
          {t('auth.signUpConfirmSubmit')}
        </Button>
        <Button
          variant="outline-secondary"
          type="button"
          disabled={busy}
          onClick={onResend}
        >
          {t('auth.signUpResendCode')}
        </Button>
      </div>
      <button
        type="button"
        className="btn btn-link p-0"
        disabled={busy}
        onClick={onEditEmail}
      >
        {t('auth.signUpEditEmail')}
      </button>
    </Form>
  )
}

export default SignupConfirmStep
