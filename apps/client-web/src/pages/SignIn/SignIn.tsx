import React from 'react'
import { Button, Card, Form, Spinner } from 'react-bootstrap'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import {
  homeAuthGateActive,
  isCognitoConfigured,
} from 'config/configureAmplify'
import { useCognitoAuth } from 'modules/CognitoAuth/CognitoAuthContext'
import CognitoSignInFields from 'modules/CognitoAuth/CognitoSignInFields'
import { useCognitoSignIn } from 'modules/CognitoAuth/useCognitoSignIn'
import { useL10n } from 'modules/Localization'

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

  if (!homeAuthGateActive) {
    return <Navigate to="/" replace />
  }

  if (signedIn) {
    return <Navigate to="/" replace />
  }

  if (isCognitoConfigured && !sessionChecked) {
    return (
      <div className="d-flex justify-content-center py-5" id="SignIn-page">
        <Spinner animation="border" role="status" />
      </div>
    )
  }

  if (!isCognitoConfigured) {
    return (
      <Card.Body style={{ padding: '10px' }} id="SignIn-page">
        <Card.Title>{t('pages.signin.title')}</Card.Title>
        <Card.Text>{t('auth.signInUnavailable')}</Card.Text>
        <Link to="/">{t('auth.signUpBackHome')}</Link>
      </Card.Body>
    )
  }

  return (
    <Card.Body style={{ padding: '10px', maxWidth: 480 }} id="SignIn-page">
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
          <Link to="/" className="small">
            {t('auth.signUpBackHome')}
          </Link>
        </div>
      </Form>
    </Card.Body>
  )
}

export default SignIn
