import React from 'react'
import { Button, Card, Form, Spinner } from 'react-bootstrap'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { isCognitoConfigured } from 'config/configureAmplify'
import { useCognitoAuth } from 'modules/CognitoAuth/CognitoAuthContext'
import { useCognitoChangePassword } from 'modules/CognitoAuth/useCognitoChangePassword'
import { useL10n } from 'modules/Localization'

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
      <Card.Body style={{ padding: '10px' }} id="ChangePassword-page">
        <Card.Title>{t('pages.changePassword.title')}</Card.Title>
        <Card.Text>{t('auth.signInUnavailable')}</Card.Text>
        <Link to="/">{t('auth.signUpBackHome')}</Link>
      </Card.Body>
    )
  }

  if (!sessionChecked) {
    return (
      <div
        className="d-flex justify-content-center py-5"
        id="ChangePassword-page"
      >
        <Spinner animation="border" role="status" />
      </div>
    )
  }

  if (!signedIn) {
    return <Navigate to="/" replace />
  }

  return (
    <Card.Body
      style={{ padding: '10px', maxWidth: 480 }}
      id="ChangePassword-page"
    >
      <Card.Title>{t('pages.changePassword.title')}</Card.Title>
      <Card.Text className="text-muted small mb-3">
        {t('pages.changePassword.subtitle')}
      </Card.Text>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="change-password-old">
          <Form.Label>{tForm('auth.changePasswordCurrent')}</Form.Label>
          <Form.Control
            type="password"
            autoComplete="current-password"
            value={oldPassword}
            onChange={(ev) => setOldPassword(ev.target.value)}
            required
            disabled={busy}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="change-password-new">
          <Form.Label>{tForm('auth.changePasswordNew')}</Form.Label>
          <Form.Control
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(ev) => setNewPassword(ev.target.value)}
            required
            disabled={busy}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="change-password-confirm">
          <Form.Label>{tForm('auth.confirmPassword')}</Form.Label>
          <Form.Control
            type="password"
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
