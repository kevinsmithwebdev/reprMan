import type React from 'react'
import { useState } from 'react'
import {
  AuthError,
  confirmResetPassword,
  resetPassword,
} from 'aws-amplify/auth'
import { useDispatch } from 'react-redux'
import { makeToastSAC } from '@reprman/state'
import { ToastLevel } from '@reprman/types'

export type ForgotPasswordStep = 'request' | 'confirm'

export type ForgotPasswordRequestMessages = {
  codeSentMessage: string
  successMessage: string
  unexpectedNextStepMessage: string
  unexpectedErrorMessage: string
}

export type ForgotPasswordConfirmMessages = {
  mismatchMessage: string
  successMessage: string
  unexpectedErrorMessage: string
}

/**
 * Encapsulates the multi-step forgot-password flow (request code → confirm
 * with new password). `onComplete` is called once the new password is set.
 */
export const useCognitoForgotPassword = (onComplete: () => void) => {
  const dispatch = useDispatch()
  const [step, setStep] = useState<ForgotPasswordStep>('request')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [busy, setBusy] = useState(false)

  const notifyError = (err: unknown, fallback: string) => {
    const message = err instanceof AuthError ? err.message : fallback
    dispatch(
      makeToastSAC({ body: message, level: ToastLevel.FAIL, delay: 8000 })
    )
  }

  const handleRequest = async (
    e: React.FormEvent,
    messages: ForgotPasswordRequestMessages
  ) => {
    e.preventDefault()
    setBusy(true)
    try {
      const result = await resetPassword({ username: email.trim() })
      const { resetPasswordStep } = result.nextStep
      if (resetPasswordStep === 'CONFIRM_RESET_PASSWORD_WITH_CODE') {
        dispatch(
          makeToastSAC({
            body: messages.codeSentMessage,
            level: ToastLevel.INFO,
            delay: 8000,
          })
        )
        setStep('confirm')
        setCode('')
        return
      }
      if (resetPasswordStep === 'DONE') {
        dispatch(
          makeToastSAC({
            body: messages.successMessage,
            level: ToastLevel.SUCCESS,
            delay: 6000,
          })
        )
        onComplete()
        return
      }
      dispatch(
        makeToastSAC({
          body: messages.unexpectedNextStepMessage,
          level: ToastLevel.WARNING,
          delay: 8000,
        })
      )
    } catch (err) {
      notifyError(err, messages.unexpectedErrorMessage)
    } finally {
      setBusy(false)
    }
  }

  const handleConfirm = async (
    e: React.FormEvent,
    messages: ForgotPasswordConfirmMessages
  ) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      dispatch(
        makeToastSAC({
          body: messages.mismatchMessage,
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
          body: messages.successMessage,
          level: ToastLevel.SUCCESS,
          delay: 6000,
        })
      )
      onComplete()
    } catch (err) {
      notifyError(err, messages.unexpectedErrorMessage)
    } finally {
      setBusy(false)
    }
  }

  const handleResend = async (messages: {
    resentMessage: string
    unexpectedErrorMessage: string
  }) => {
    setBusy(true)
    try {
      await resetPassword({ username: email.trim() })
      dispatch(
        makeToastSAC({
          body: messages.resentMessage,
          level: ToastLevel.SUCCESS,
          delay: 6000,
        })
      )
    } catch (err) {
      notifyError(err, messages.unexpectedErrorMessage)
    } finally {
      setBusy(false)
    }
  }

  const reset = () => {
    setStep('request')
    setCode('')
    setNewPassword('')
    setConfirmPassword('')
  }

  return {
    step,
    email,
    setEmail,
    code,
    setCode,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    busy,
    handleRequest,
    handleConfirm,
    handleResend,
    reset,
  }
}
