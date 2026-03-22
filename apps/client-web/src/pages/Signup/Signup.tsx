import React, { useState } from 'react'
import {
  AuthError,
  confirmSignUp,
  resendSignUpCode,
  signIn,
  signUp,
} from 'aws-amplify/auth'
import { Button, Card, Form, Spinner } from 'react-bootstrap'
import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { isCognitoConfigured } from 'config/configureAmplify'
import { userFromCognitoSession } from 'modules/CognitoAuth'
import { useL10n } from 'modules/Localization'
import { setUser } from 'state/user/user.actions'
import { makeToastSAC } from 'state/sagas/toast/toast.actions'
import { ToastLevel } from 'types'

type Step = 'register' | 'confirm'

const Signup = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { t } = useL10n()
  const [step, setStep] = useState<Step>('register')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)

  const notifyError = (err: unknown, fallbackKey: string) => {
    const message = err instanceof AuthError ? err.message : t(fallbackKey)
    dispatch(
      makeToastSAC({
        body: message,
        level: ToastLevel.FAIL,
        delay: 8000,
      })
    )
  }

  const finishSignedIn = async () => {
    const nextUser = await userFromCognitoSession()
    if (nextUser) {
      dispatch(setUser(nextUser))
    }
    dispatch(
      makeToastSAC({
        body: t('auth.signUpSuccessSignedIn'),
        level: ToastLevel.SUCCESS,
        delay: 5000,
      })
    )
    navigate('/')
  }

  const signInAfterPassword = async () => {
    const result = await signIn({
      username: email.trim(),
      password,
    })
    if (!result.isSignedIn) {
      dispatch(
        makeToastSAC({
          body: t('auth.signInChallengeNotSupported'),
          level: ToastLevel.WARNING,
          delay: 8000,
        })
      )
      navigate('/')
      return
    }
    await finishSignedIn()
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      dispatch(
        makeToastSAC({
          body: t('auth.signUpPasswordMismatch'),
          level: ToastLevel.WARNING,
          delay: 6000,
        })
      )
      return
    }

    setBusy(true)
    try {
      const result = await signUp({
        username: email.trim(),
        password,
        options: {
          userAttributes: {
            email: email.trim(),
          },
        },
      })

      if (result.isSignUpComplete && result.nextStep.signUpStep === 'DONE') {
        await signInAfterPassword()
        return
      }

      if (result.nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        dispatch(
          makeToastSAC({
            body: t('auth.signUpCodeSent'),
            level: ToastLevel.INFO,
            delay: 8000,
          })
        )
        setStep('confirm')
        return
      }

      dispatch(
        makeToastSAC({
          body: t('auth.signUpUnexpectedNextStep'),
          level: ToastLevel.WARNING,
          delay: 8000,
        })
      )
    } catch (err) {
      notifyError(err, 'auth.signUpUnexpectedError')
    } finally {
      setBusy(false)
    }
  }

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      await confirmSignUp({
        username: email.trim(),
        confirmationCode: code.trim(),
      })
      await signInAfterPassword()
    } catch (err) {
      notifyError(err, 'auth.signUpConfirmUnexpectedError')
    } finally {
      setBusy(false)
    }
  }

  const handleResend = async () => {
    setBusy(true)
    try {
      await resendSignUpCode({ username: email.trim() })
      dispatch(
        makeToastSAC({
          body: t('auth.signUpCodeResent'),
          level: ToastLevel.SUCCESS,
          delay: 6000,
        })
      )
    } catch (err) {
      notifyError(err, 'auth.signUpResendUnexpectedError')
    } finally {
      setBusy(false)
    }
  }

  if (!isCognitoConfigured) {
    return (
      <Card.Body style={{ padding: '10px' }} id="Signup-page">
        <Card.Title>{t('pages.signup.title')}</Card.Title>
        <Card.Text>{t('auth.signUpUnavailable')}</Card.Text>
        <Link to="/">{t('auth.signUpBackHome')}</Link>
      </Card.Body>
    )
  }

  return (
    <Card.Body style={{ padding: '10px', maxWidth: 480 }} id="Signup-page">
      <Card.Title>{t('pages.signup.title')}</Card.Title>

      {step === 'register' ? (
        <Form onSubmit={handleRegister}>
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
            <Form.Control
              type="password"
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
            <Form.Control
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(ev) => setConfirmPassword(ev.target.value)}
              required
              disabled={busy}
              minLength={8}
            />
          </Form.Group>
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <Button variant="primary" type="submit" disabled={busy}>
              {busy ? (
                <Spinner animation="border" size="sm" className="me-1" />
              ) : null}
              {t('auth.signUpSubmit')}
            </Button>
            <Link to="/">{t('auth.signUpBackHome')}</Link>
          </div>
        </Form>
      ) : (
        <Form onSubmit={handleConfirm}>
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
              onClick={() => handleResend()}
            >
              {t('auth.signUpResendCode')}
            </Button>
          </div>
          <button
            type="button"
            className="btn btn-link p-0"
            disabled={busy}
            onClick={() => {
              setStep('register')
              setCode('')
            }}
          >
            {t('auth.signUpEditEmail')}
          </button>
        </Form>
      )}
    </Card.Body>
  )
}

export default Signup
