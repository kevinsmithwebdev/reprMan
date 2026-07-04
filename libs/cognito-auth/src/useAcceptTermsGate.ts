import { useCallback, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { TERMS_VERSION } from '@reprman/constants'
import { isReprsApiConfigured, ReprsApiModule } from '@reprman/reprs-api'
import { useL10n } from '@reprman/localization'
import {
  selectNeedsTermsAcceptance,
  selectTermsConfigLoaded,
  setTermsConfig,
} from '@reprman/state/reprsQuota'
import { makeToastSAC } from '@reprman/state/sagas/toast/toast.actions'
import { ToastLevel } from '@reprman/types'
import { useCognitoAuth } from './CognitoAuthContext'

export type UseAcceptTermsGateOptions = {
  skip?: boolean
}

export const useAcceptTermsGate = ({
  skip = false,
}: UseAcceptTermsGateOptions = {}) => {
  const dispatch = useDispatch()
  const { t } = useL10n()
  const { signedIn, sessionChecked } = useCognitoAuth()
  const needsAcceptance = useSelector(selectNeedsTermsAcceptance)
  const termsConfigLoaded = useSelector(selectTermsConfigLoaded)
  const [accepted, setAccepted] = useState(false)
  const [busy, setBusy] = useState(false)

  const show = useMemo(
    () =>
      !skip &&
      isReprsApiConfigured &&
      sessionChecked &&
      signedIn &&
      termsConfigLoaded &&
      needsAcceptance,
    [needsAcceptance, sessionChecked, signedIn, skip, termsConfigLoaded]
  )

  const handleAccept = useCallback(async () => {
    if (!accepted) {
      return
    }
    setBusy(true)
    try {
      const result = await ReprsApiModule.getInstance().acceptTerms(
        TERMS_VERSION
      )
      dispatch(
        setTermsConfig({
          termsAcceptedAt: result.termsAcceptedAt,
          termsVersion: result.termsVersion,
          currentTermsVersion: result.currentTermsVersion,
        })
      )
      setAccepted(false)
    } catch {
      dispatch(
        makeToastSAC({
          body: t('auth.acceptTermsFailed'),
          level: ToastLevel.FAIL,
          delay: 8000,
        })
      )
    } finally {
      setBusy(false)
    }
  }, [accepted, dispatch, t])

  return {
    show,
    accepted,
    setAccepted,
    busy,
    handleAccept,
  }
}
