import React from 'react'
import { Card } from 'react-bootstrap'
import { Navigate, useNavigate } from 'react-router-dom'
import { AuthUnavailableCard, CenteredSpinner } from '@reprman/components'
import {
  homeAuthGateActive,
  isCognitoConfigured,
  useCognitoAuth,
  useCognitoForgotPassword,
} from '@reprman/cognito-auth'
import { useL10n } from '@reprman/localization'

import ForgotPasswordConfirmStep from './ForgotPasswordConfirmStep'
import ForgotPasswordRequestStep from './ForgotPasswordRequestStep'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const { t } = useL10n()
  const { sessionChecked, signedIn } = useCognitoAuth()
  const flow = useCognitoForgotPassword(() =>
    navigate('/signin', { replace: true })
  )

  if (!homeAuthGateActive() || signedIn) {
    return <Navigate to="/" replace />
  }

  if (isCognitoConfigured() && !sessionChecked) {
    return <CenteredSpinner id="ForgotPassword-page" />
  }

  if (!isCognitoConfigured()) {
    return (
      <AuthUnavailableCard
        pageId="ForgotPassword-page"
        titleKey="pages.forgotPassword.title"
        messageKey="auth.signInUnavailable"
      />
    )
  }

  const handleRequest = (e: React.FormEvent) =>
    flow.handleRequest(e, {
      codeSentMessage: t('auth.forgotPasswordCodeSent'),
      successMessage: t('auth.forgotPasswordSuccess'),
      unexpectedNextStepMessage: t('auth.forgotPasswordUnexpectedNextStep'),
      unexpectedErrorMessage: t('auth.forgotPasswordUnexpectedError'),
    })

  const handleConfirm = (e: React.FormEvent) =>
    flow.handleConfirm(e, {
      mismatchMessage: t('auth.changePasswordMismatch'),
      successMessage: t('auth.forgotPasswordSuccess'),
      unexpectedErrorMessage: t('auth.forgotPasswordConfirmUnexpectedError'),
    })

  const handleResend = () =>
    flow.handleResend({
      resentMessage: t('auth.signUpCodeResent'),
      unexpectedErrorMessage: t('auth.forgotPasswordUnexpectedError'),
    })

  return (
    <Card.Body
      className="app-page-padded"
      style={{ maxWidth: 480, margin: '0 auto' }}
      id="ForgotPassword-page"
    >
      <Card.Title>{t('pages.forgotPassword.title')}</Card.Title>

      {flow.step === 'request' ? (
        <ForgotPasswordRequestStep
          email={flow.email}
          setEmail={flow.setEmail}
          busy={flow.busy}
          onSubmit={handleRequest}
        />
      ) : (
        <ForgotPasswordConfirmStep
          email={flow.email}
          code={flow.code}
          setCode={flow.setCode}
          newPassword={flow.newPassword}
          setNewPassword={flow.setNewPassword}
          confirmPassword={flow.confirmPassword}
          setConfirmPassword={flow.setConfirmPassword}
          busy={flow.busy}
          onSubmit={handleConfirm}
          onResend={handleResend}
          onEditEmail={flow.reset}
        />
      )}
    </Card.Body>
  )
}

export default ForgotPassword
