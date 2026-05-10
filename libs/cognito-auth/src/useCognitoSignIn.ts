import type { FormEvent } from 'react'
import { useState } from 'react'
import { AuthError, signIn } from 'aws-amplify/auth'
import { useDispatch } from 'react-redux'
import { useL10n } from '@reprman/localization'
import { runGenesisSaga } from '@reprman/state/sagas/genesis/genesis.actions'
import { makeToastSAC } from '@reprman/state/sagas/toast/toast.actions'
import { ToastLevel } from '@reprman/types'

export function useCognitoSignIn(
  refreshSession: () => Promise<void>,
  onSuccess: () => void
) {
  const dispatch = useDispatch()
  const { t } = useL10n()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
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
        setBusy(false)
        return
      }
      await refreshSession()
      dispatch(runGenesisSaga({ afterSignIn: true }))
      setPassword('')
      onSuccess()
    } catch (err) {
      notifyAuthError(err)
    } finally {
      setBusy(false)
    }
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    busy,
    handleSignIn,
    t,
  }
}
