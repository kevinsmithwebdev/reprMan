import React from 'react'
import { Button, Card, Form, Spinner } from 'react-bootstrap'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AuthUnavailableCard, CenteredSpinner } from '@reprman/components'
import {
  CognitoSignInFields,
  homeAuthGateActive,
  isCognitoConfigured,
  useCognitoAuth,
  useCognitoSignIn,
} from '@reprman/cognito-auth'
import { useL10n } from '@reprman/localization'

const SignIn = () => {
  const navigate = useNavigate()
  const { t } = useL10n()
  const { sessionChecked, signedIn, refreshSession } = useCognitoAuth()
  const {
    email,
    setEmail,
    password,
    setPassword,
    busy,
    handleSignIn,
    t: tForm,
  } = useCognitoSignIn(refreshSession, () => navigate('/', { replace: true }))

  if (!homeAuthGateActive || signedIn) {
    return <Navigate to="/" replace />
  }

  if (isCognitoConfigured && !sessionChecked) {
    return <CenteredSpinner id="SignIn-page" />
  }

  if (!isCognitoConfigured) {
    return (
      <AuthUnavailableCard
        pageId="SignIn-page"
        titleKey="pages.signin.title"
        messageKey="auth.signInUnavailable"
      />
    )
  }

  return (
    <Card.Body
      className="app-page-padded"
      style={{ maxWidth: 480, margin: '0 auto' }}
      id="SignIn-page"
    >
      <Card.Title>{t('pages.signin.title')}</Card.Title>
      <Form onSubmit={handleSignIn}>
        <CognitoSignInFields
          idPrefix="signin-page"
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          busy={busy}
          emailLabel={tForm('auth.email')}
          passwordLabel={tForm('auth.password')}
          createAccountLabel={tForm('auth.signUpButton')}
          onCreateAccountNavigate={() => navigate('/signup')}
        />
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
            {tForm('auth.signInButton')}
          </Button>
          <Link to="/forgot-password" className="small">
            {t('auth.forgotPasswordLink')}
          </Link>
          <Link to="/" className="small">
            {t('auth.signUpBackHome')}
          </Link>
        </div>
      </Form>
    </Card.Body>
  )
}

export default SignIn
