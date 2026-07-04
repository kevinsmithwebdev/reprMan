'use client'

import React from 'react'
import Link from 'next/link'
import { Button, Form, Spinner } from 'react-bootstrap'
import { PasswordFormControl, TermsLink } from '@reprman/components'
import { useL10n } from '@reprman/localization'

interface SignupRegisterStepProps {
  email: string
  setEmail: (v: string) => void
  password: string
  setPassword: (v: string) => void
  confirmPassword: string
  setConfirmPassword: (v: string) => void
  acceptedTerms: boolean
  setAcceptedTerms: (v: boolean) => void
  busy: boolean
  onSubmit: (e: React.FormEvent) => void
}

const SignupRegisterStep = ({
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  acceptedTerms,
  setAcceptedTerms,
  busy,
  onSubmit,
}: SignupRegisterStepProps) => {
  const { t } = useL10n()
  return (
    <Form onSubmit={onSubmit}>
      <Form.Group className="mb-3" controlId="signup-email">
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
      <Form.Group className="mb-3" controlId="signup-password">
        <Form.Label>{t('auth.password')}</Form.Label>
        <PasswordFormControl
          autoComplete="new-password"
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
          required
          disabled={busy}
          minLength={8}
        />
        <Form.Text className="text-muted">
          {t('auth.signUpPasswordHint')}
        </Form.Text>
      </Form.Group>
      <Form.Group className="mb-3" controlId="signup-password-confirm">
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
      <Form.Group className="mb-3" controlId="signup-terms">
        <Form.Check
          type="checkbox"
          checked={acceptedTerms}
          onChange={(ev) => setAcceptedTerms(ev.target.checked)}
          disabled={busy}
          required
          label={
            <span>
              {t('auth.signUpTermsPrefix')} <TermsLink />
            </span>
          }
        />
      </Form.Group>
      <div className="d-flex flex-wrap gap-2 align-items-center">
        <Button
          variant="primary"
          type="submit"
          disabled={busy || !acceptedTerms}
        >
          {busy ? (
            <Spinner animation="border" size="sm" className="me-1" />
          ) : null}
          {t('auth.signUpSubmit')}
        </Button>
        <Link href="/">{t('auth.signUpBackHome')}</Link>
      </div>
    </Form>
  )
}

export default SignupRegisterStep
