'use client'

import React from 'react'
import { Button, Form, Spinner } from 'react-bootstrap'
import { PasswordFormControl } from '@reprman/components'
import { useL10n } from '@reprman/localization'

interface ForgotPasswordConfirmStepProps {
  email: string
  code: string
  setCode: (v: string) => void
  newPassword: string
  setNewPassword: (v: string) => void
  confirmPassword: string
  setConfirmPassword: (v: string) => void
  busy: boolean
  onSubmit: (e: React.FormEvent) => void
  onResend: () => void
  onEditEmail: () => void
}

const ForgotPasswordConfirmStep = ({
  email,
  code,
  setCode,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  busy,
  onSubmit,
  onResend,
  onEditEmail,
}: ForgotPasswordConfirmStepProps) => {
  const { t } = useL10n()
  return (
    <Form onSubmit={onSubmit}>
      <p className="small mb-3">
        {t('auth.forgotPasswordConfirmIntro', { email: email.trim() })}
      </p>
      <Form.Group className="mb-3" controlId="forgot-code">
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
      <Form.Group className="mb-3" controlId="forgot-new-password">
        <Form.Label>{t('auth.changePasswordNew')}</Form.Label>
        <PasswordFormControl
          autoComplete="new-password"
          value={newPassword}
          onChange={(ev) => setNewPassword(ev.target.value)}
          required
          disabled={busy}
          minLength={8}
        />
        <Form.Text className="text-muted">
          {t('auth.signUpPasswordHint')}
        </Form.Text>
      </Form.Group>
      <Form.Group className="mb-3" controlId="forgot-confirm-password">
        <Form.Label>{t('auth.confirmPassword')}</Form.Label>
        <PasswordFormControl
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(ev) => setConfirmPassword(ev.target.value)}
          required
          disabled={busy}
          minLength={8}
        />
      </Form.Group>
      <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
        <Button variant="primary" type="submit" disabled={busy}>
          {busy ? (
            <Spinner
              animation="border"
              size="sm"
              className="me-1"
              role="status"
            />
          ) : null}
          {t('auth.forgotPasswordSubmit')}
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

export default ForgotPasswordConfirmStep
