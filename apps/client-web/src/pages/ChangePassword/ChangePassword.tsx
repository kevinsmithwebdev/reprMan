import React from 'react'
import { Button, Card, Form, Spinner } from 'react-bootstrap'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import {
  AuthUnavailableCard,
  CenteredSpinner,
  PasswordFormControl,
} from '@reprman/components'
import {
  isCognitoConfigured,
  useCognitoAuth,
  useCognitoChangePassword,
} from '@reprman/cognito-auth'
import { useL10n } from '@reprman/localization'

const ChangePassword = () => {
  const navigate = useNavigate()
  const { t } = useL10n()
  const { sessionChecked, signedIn } = useCognitoAuth()
  const {
    oldPassword,
    setOldPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    busy,
    handleSubmit,
    t: tForm,
  } = useCognitoChangePassword(() => navigate('/', { replace: true }))

  if (!isCognitoConfigured) {
    return (
      <AuthUnavailableCard
        pageId="ChangePassword-page"
        titleKey="pages.changePassword.title"
        messageKey="auth.signInUnavailable"
      />
    )
  }

  if (!sessionChecked) {
    return <CenteredSpinner id="ChangePassword-page" />
  }

  if (!signedIn) {
    return <Navigate to="/" replace />
  }

  return (
    <Card.Body
      className="app-page-padded"
      style={{ maxWidth: 480, margin: '0 auto' }}
      id="ChangePassword-page"
    >
      <Card.Title>{t('pages.changePassword.title')}</Card.Title>
      <Card.Text className="text-muted small mb-3">
        {t('pages.changePassword.subtitle')}
      </Card.Text>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="change-password-old">
          <Form.Label>{tForm('auth.changePasswordCurrent')}</Form.Label>
          <PasswordFormControl
            autoComplete="current-password"
            value={oldPassword}
            onChange={(ev) => setOldPassword(ev.target.value)}
            required
            disabled={busy}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="change-password-new">
          <Form.Label>{tForm('auth.changePasswordNew')}</Form.Label>
          <PasswordFormControl
            autoComplete="new-password"
            value={newPassword}
            onChange={(ev) => setNewPassword(ev.target.value)}
            required
            disabled={busy}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="change-password-confirm">
          <Form.Label>{tForm('auth.confirmPassword')}</Form.Label>
          <PasswordFormControl
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(ev) => setConfirmPassword(ev.target.value)}
            required
            disabled={busy}
          />
        </Form.Group>
        <p className="small text-muted mb-3">{t('auth.signUpPasswordHint')}</p>
        <div className="d-flex flex-wrap gap-2 align-items-center">
          <Button variant="primary" type="submit" disabled={busy}>
            {busy ? (
              <Spinner
                animation="border"
                size="sm"
                className="me-1"
                role="status"
              />
            ) : null}
            {tForm('auth.changePasswordSubmit')}
          </Button>
          <Link to="/" className="small">
            {t('auth.signUpBackHome')}
          </Link>
        </div>
      </Form>
    </Card.Body>
  )
}

export default ChangePassword
