import type { FormEvent } from 'react'
import { useState } from 'react'
import { AuthError, updatePassword } from 'aws-amplify/auth'
import { useDispatch } from 'react-redux'
import { useL10n } from 'modules/Localization'
import { makeToastSAC } from 'state/sagas/toast/toast.actions'
import { ToastLevel } from 'types'

export function useCognitoChangePassword(onSuccess?: () => void) {
  const dispatch = useDispatch()
  const { t } = useL10n()
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [busy, setBusy] = useState(false)

  const notifyAuthError = (err: unknown) => {
    const message =
      err instanceof AuthError ? err.message : t('auth.signInUnexpectedError')
    dispatch(
      makeToastSAC({
        body: message,
        level: ToastLevel.FAIL,
        delay: 6000,
      })
    )
  }

  const handleSubmit = async (e: FormEvent) => {
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
      await updatePassword({ oldPassword, newPassword })
      dispatch(
        makeToastSAC({
          body: t('auth.changePasswordSuccess'),
          level: ToastLevel.SUCCESS,
          delay: 5000,
        })
      )
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
      onSuccess?.()
    } catch (err) {
      notifyAuthError(err)
    } finally {
      setBusy(false)
    }
  }

  return {
    oldPassword,
    setOldPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    busy,
    handleSubmit,
    t,
  }
}
