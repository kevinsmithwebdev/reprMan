import type React from 'react'
import { useState } from 'react'
import {
  AuthError,
  confirmSignUp,
  resendSignUpCode,
  signIn,
  signUp,
} from 'aws-amplify/auth'
import { useDispatch } from 'react-redux'
import { makeToastSAC, runGenesisSaga, setUser } from '@reprman/state'
import { ToastLevel } from '@reprman/types'

import { userFromCognitoSession } from './cognitoSession'

export type SignUpStep = 'register' | 'confirm'

/**
 * Encapsulates the multi-step sign-up flow (register -> confirm -> auto sign-in)
 * so the page component can stay focused on rendering. `onSignedIn` is called
 * after a successful auto sign-in (typically navigates the user to home).
 */
export type UseCognitoSignUpOptions = {
  recordTermsAcceptance?: () => Promise<void>
}

export const useCognitoSignUp = (
  onSignedIn: () => void,
  options: UseCognitoSignUpOptions = {}
) => {
  const dispatch = useDispatch()
  const [step, setStep] = useState<SignUpStep>('register')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)

  const notifyError = (err: unknown, fallback: string) => {
    const message = err instanceof AuthError ? err.message : fallback
    dispatch(
      makeToastSAC({ body: message, level: ToastLevel.FAIL, delay: 8000 })
    )
  }

  const finishSignedIn = async (
    signedInToastBody: string,
    termsAcceptFailedMessage: string
  ) => {
    if (options.recordTermsAcceptance) {
      try {
        await options.recordTermsAcceptance()
      } catch {
        dispatch(
          makeToastSAC({
            body: termsAcceptFailedMessage,
            level: ToastLevel.FAIL,
            delay: 8000,
          })
        )
        return
      }
    }
    const nextUser = await userFromCognitoSession()
    if (nextUser) dispatch(setUser(nextUser))
    dispatch(runGenesisSaga({ afterSignIn: true }))
    dispatch(
      makeToastSAC({
        body: signedInToastBody,
        level: ToastLevel.SUCCESS,
        delay: 5000,
      })
    )
    onSignedIn()
  }

  const signInAfterPassword = async (
    signedInToastBody: string,
    termsAcceptFailedMessage: string
  ) => {
    const result = await signIn({ username: email.trim(), password })
    if (!result.isSignedIn) {
      dispatch(
        makeToastSAC({
          body: 'auth.signInChallengeNotSupported',
          level: ToastLevel.WARNING,
          delay: 8000,
        })
      )
      onSignedIn()
      return
    }
    await finishSignedIn(signedInToastBody, termsAcceptFailedMessage)
  }

  const handleRegister = async (
    e: React.FormEvent,
    options: {
      acceptedTerms: boolean
      termsRequiredMessage: string
      mismatchMessage: string
      codeSentMessage: string
      unexpectedNextStepMessage: string
      unexpectedErrorMessage: string
      signedInMessage: string
      termsAcceptFailedMessage: string
    }
  ) => {
    e.preventDefault()
    if (!options.acceptedTerms) {
      dispatch(
        makeToastSAC({
          body: options.termsRequiredMessage,
          level: ToastLevel.WARNING,
          delay: 6000,
        })
      )
      return
    }
    if (password !== confirmPassword) {
      dispatch(
        makeToastSAC({
          body: options.mismatchMessage,
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
        options: { userAttributes: { email: email.trim() } },
      })

      if (result.isSignUpComplete && result.nextStep.signUpStep === 'DONE') {
        await signInAfterPassword(
          options.signedInMessage,
          options.termsAcceptFailedMessage
        )
        return
      }

      if (result.nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        dispatch(
          makeToastSAC({
            body: options.codeSentMessage,
            level: ToastLevel.INFO,
            delay: 8000,
          })
        )
        setStep('confirm')
        return
      }

      dispatch(
        makeToastSAC({
          body: options.unexpectedNextStepMessage,
          level: ToastLevel.WARNING,
          delay: 8000,
        })
      )
    } catch (err) {
      notifyError(err, options.unexpectedErrorMessage)
    } finally {
      setBusy(false)
    }
  }

  const handleConfirm = async (
    e: React.FormEvent,
    options: {
      signedInMessage: string
      unexpectedErrorMessage: string
      termsAcceptFailedMessage: string
    }
  ) => {
    e.preventDefault()
    setBusy(true)
    try {
      await confirmSignUp({
        username: email.trim(),
        confirmationCode: code.trim(),
      })
      await signInAfterPassword(
        options.signedInMessage,
        options.termsAcceptFailedMessage
      )
    } catch (err) {
      notifyError(err, options.unexpectedErrorMessage)
    } finally {
      setBusy(false)
    }
  }

  const handleResend = async (options: {
    resentMessage: string
    unexpectedErrorMessage: string
  }) => {
    setBusy(true)
    try {
      await resendSignUpCode({ username: email.trim() })
      dispatch(
        makeToastSAC({
          body: options.resentMessage,
          level: ToastLevel.SUCCESS,
          delay: 6000,
        })
      )
    } catch (err) {
      notifyError(err, options.unexpectedErrorMessage)
    } finally {
      setBusy(false)
    }
  }

  return {
    step,
    setStep,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    code,
    setCode,
    busy,
    handleRegister,
    handleConfirm,
    handleResend,
  }
}
