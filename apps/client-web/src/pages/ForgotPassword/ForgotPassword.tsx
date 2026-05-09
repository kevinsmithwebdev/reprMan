import React, { useState } from 'react'
import {
  AuthError,
  confirmResetPassword,
  resetPassword,
} from 'aws-amplify/auth'
import PasswordFormControl from 'components/PasswordFormControl'
import { Button, Card, Form, Spinner } from 'react-bootstrap'
import { useDispatch } from 'react-redux'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import {
  homeAuthGateActive,
  isCognitoConfigured,
} from 'config/configureAmplify'
import { useCognitoAuth } from 'modules/CognitoAuth/CognitoAuthContext'
import { useL10n } from 'modules/Localization'
import { makeToastSAC } from 'state/sagas/toast/toast.actions'
import { ToastLevel } from 'types'

type Step = 'request' | 'confirm'

const ForgotPassword = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { t } = useL10n()
  const { sessionChecked, signedIn } = useCognitoAuth()
  const [step, setStep] = useState<Step>('request')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
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

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      const result = await resetPassword({ username: email.trim() })
      const { nextStep } = result
      if (nextStep.resetPasswordStep === 'CONFIRM_RESET_PASSWORD_WITH_CODE') {
        dispatch(
          makeToastSAC({
            body: t('auth.forgotPasswordCodeSent'),
            level: ToastLevel.INFO,
            delay: 8000,
          })
        )
        setStep('confirm')
        setCode('')
        return
      }
      if (nextStep.resetPasswordStep === 'DONE') {
        dispatch(
          makeToastSAC({
            body: t('auth.forgotPasswordSuccess'),
            level: ToastLevel.SUCCESS,
            delay: 6000,
          })
        )
        navigate('/signin', { replace: true })
        return
      }
      dispatch(
        makeToastSAC({
          body: t('auth.forgotPasswordUnexpectedNextStep'),
          level: ToastLevel.WARNING,
          delay: 8000,
        })
      )
    } catch (err) {
      notifyError(err, 'auth.forgotPasswordUnexpectedError')
    } finally {
      setBusy(false)
    }
  }

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      dispatch(
        makeToastSAC({
          body: t('auth.changePasswordMismatch'),
          level: ToastLevel.WARNING,
          delay: 6000,
        })
      )
      return
    }
    setBusy(true)
    try {
      await confirmResetPassword({
        username: email.trim(),
        confirmationCode: code.trim(),
        newPassword,
      })
      dispatch(
        makeToastSAC({
          body: t('auth.forgotPasswordSuccess'),
          level: ToastLevel.SUCCESS,
          delay: 6000,
        })
      )
      navigate('/signin', { replace: true })
    } catch (err) {
      notifyError(err, 'auth.forgotPasswordConfirmUnexpectedError')
    } finally {
      setBusy(false)
    }
  }

  const handleResend = async () => {
    setBusy(true)
    try {
      await resetPassword({ username: email.trim() })
      dispatch(
        makeToastSAC({
          body: t('auth.signUpCodeResent'),
          level: ToastLevel.SUCCESS,
          delay: 6000,
        })
      )
    } catch (err) {
      notifyError(err, 'auth.forgotPasswordUnexpectedError')
    } finally {
      setBusy(false)
    }
  }

  if (!homeAuthGateActive) {
    return <Navigate to="/" replace />
  }

  if (signedIn) {
    return <Navigate to="/" replace />
  }

  if (isCognitoConfigured && !sessionChecked) {
    return (
      <div
        className="d-flex justify-content-center py-5"
        id="ForgotPassword-page"
      >
        <Spinner animation="border" role="status" />
      </div>
    )
  }

  if (!isCognitoConfigured) {
    return (
      <Card.Body style={{ padding: '10px' }} id="ForgotPassword-page">
        <Card.Title>{t('pages.forgotPassword.title')}</Card.Title>
        <Card.Text>{t('auth.signInUnavailable')}</Card.Text>
        <Link to="/">{t('auth.signUpBackHome')}</Link>
      </Card.Body>
    )
  }

  return (
    <Card.Body
      style={{ padding: '10px', maxWidth: 480 }}
      id="ForgotPassword-page"
    >
      <Card.Title>{t('pages.forgotPassword.title')}</Card.Title>

      {step === 'request' ? (
        <>
          <Card.Text className="text-muted small mb-3">
            {t('pages.forgotPassword.subtitle')}
          </Card.Text>
          <Form onSubmit={handleRequest}>
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
              <Link to="/signin" className="small">
                {t('auth.signIn')}
              </Link>
              <Link to="/" className="small">
                {t('auth.signUpBackHome')}
              </Link>
            </div>
          </Form>
        </>
      ) : (
        <Form onSubmit={handleConfirm}>
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
              setStep('request')
              setCode('')
              setNewPassword('')
              setConfirmPassword('')
            }}
          >
            {t('auth.signUpEditEmail')}
          </button>
        </Form>
      )}
    </Card.Body>
  )
}

export default ForgotPassword
