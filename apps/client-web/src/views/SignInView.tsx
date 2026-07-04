'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button, Card, Form, Spinner } from 'react-bootstrap'
import { AuthUnavailableCard, CenteredSpinner } from '@reprman/components'
import {
  CognitoSignInFields,
  isCognitoConfigured,
  useCognitoAuth,
  useCognitoSignIn,
} from '@reprman/cognito-auth'
import { useL10n } from '@reprman/localization'
import { useReplaceWhen } from '../hooks/useReplaceWhen'

const SignInView = () => {
  const router = useRouter()
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
  } = useCognitoSignIn(refreshSession, () => router.replace('/'))

  useReplaceWhen(signedIn, '/')

  if (signedIn) {
    return null
  }

  if (isCognitoConfigured() && !sessionChecked) {
    return <CenteredSpinner id="SignIn-page" />
  }

  if (!isCognitoConfigured()) {
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
          onCreateAccountNavigate={() => router.push('/signup')}
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
          <Link href="/forgot-password" className="small">
            {t('auth.forgotPasswordLink')}
          </Link>
          <Link href="/" className="small">
            {t('auth.signUpBackHome')}
          </Link>
        </div>
      </Form>
    </Card.Body>
  )
}

export default SignInView
