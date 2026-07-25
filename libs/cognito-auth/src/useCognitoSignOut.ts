import { useState } from 'react'
import { AuthError, signOut } from 'aws-amplify/auth'
import { useDispatch } from 'react-redux'
import { useL10n } from '@reprman/localization'
import { clearAllCategoryData } from '@reprman/state/categories'
import { resetReprs } from '@reprman/state/reprs'
import { makeToastSAC } from '@reprman/state/sagas/toast/toast.actions'
import { resetSettingsAC } from '@reprman/state/settings/settings.actions'
import { clearUser } from '@reprman/state/user/user.actions'
import { ToastLevel } from '@reprman/types'

export function useCognitoSignOut() {
  const dispatch = useDispatch()
  const { t } = useL10n()
  const [busy, setBusy] = useState(false)

  const handleSignOut = async () => {
    setBusy(true)
    try {
      await signOut()
      dispatch(clearUser())
      dispatch(resetReprs())
      dispatch(clearAllCategoryData())
      dispatch(resetSettingsAC())
    } catch (err) {
      const message =
        err instanceof AuthError ? err.message : t('auth.signInUnexpectedError')
      dispatch(
        makeToastSAC({
          body: message,
          level: ToastLevel.FAIL,
          delay: 6000,
        })
      )
    } finally {
      setBusy(false)
    }
  }

  return {
    busy,
    handleSignOut,
  }
}
