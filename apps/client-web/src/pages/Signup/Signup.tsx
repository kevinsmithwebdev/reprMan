import React, { useCallback, useState } from 'react'
import { Card } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { AuthUnavailableCard } from '@reprman/components'
import { TERMS_VERSION } from '@reprman/constants'
import { isCognitoConfigured, useCognitoSignUp } from '@reprman/cognito-auth'
import { useL10n } from '@reprman/localization'
import { isReprsApiConfigured, ReprsApiModule } from '@reprman/reprs-api'

import SignupConfirmStep from './SignupConfirmStep'
import SignupRegisterStep from './SignupRegisterStep'

const Signup = () => {
  const navigate = useNavigate()
  const { t } = useL10n()
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const recordTermsAcceptance = useCallback(async () => {
    if (!isReprsApiConfigured) {
      return
    }
    await ReprsApiModule.getInstance().acceptTerms(TERMS_VERSION)
  }, [])

  const flow = useCognitoSignUp(() => navigate('/'), {
    recordTermsAcceptance: isReprsApiConfigured
      ? recordTermsAcceptance
      : undefined,
  })

  if (!isCognitoConfigured) {
    return (
      <AuthUnavailableCard
        pageId="Signup-page"
        titleKey="pages.signup.title"
        messageKey="auth.signUpUnavailable"
      />
    )
  }

  const handleRegister = (e: React.FormEvent) =>
    flow.handleRegister(e, {
      acceptedTerms,
      termsRequiredMessage: t('auth.signUpTermsRequired'),
      mismatchMessage: t('auth.signUpPasswordMismatch'),
      codeSentMessage: t('auth.signUpCodeSent'),
      unexpectedNextStepMessage: t('auth.signUpUnexpectedNextStep'),
      unexpectedErrorMessage: t('auth.signUpUnexpectedError'),
      signedInMessage: t('auth.signUpSuccessSignedIn'),
      termsAcceptFailedMessage: t('auth.signUpTermsAcceptFailed'),
    })

  const handleConfirm = (e: React.FormEvent) =>
    flow.handleConfirm(e, {
      signedInMessage: t('auth.signUpSuccessSignedIn'),
      unexpectedErrorMessage: t('auth.signUpConfirmUnexpectedError'),
      termsAcceptFailedMessage: t('auth.signUpTermsAcceptFailed'),
    })

  const handleResend = () =>
    flow.handleResend({
      resentMessage: t('auth.signUpCodeResent'),
      unexpectedErrorMessage: t('auth.signUpResendUnexpectedError'),
    })

  return (
    <Card.Body
      className="app-page-padded"
      style={{ maxWidth: 480, margin: '0 auto' }}
      id="Signup-page"
    >
      <Card.Title>{t('pages.signup.title')}</Card.Title>

      {flow.step === 'register' ? (
        <SignupRegisterStep
          email={flow.email}
          setEmail={flow.setEmail}
          password={flow.password}
          setPassword={flow.setPassword}
          confirmPassword={flow.confirmPassword}
          setConfirmPassword={flow.setConfirmPassword}
          acceptedTerms={acceptedTerms}
          setAcceptedTerms={setAcceptedTerms}
          busy={flow.busy}
          onSubmit={handleRegister}
        />
      ) : (
        <SignupConfirmStep
          email={flow.email}
          code={flow.code}
          setCode={flow.setCode}
          busy={flow.busy}
          onSubmit={handleConfirm}
          onResend={handleResend}
          onEditEmail={() => {
            flow.setStep('register')
            flow.setCode('')
          }}
        />
      )}
    </Card.Body>
  )
}

export default Signup
