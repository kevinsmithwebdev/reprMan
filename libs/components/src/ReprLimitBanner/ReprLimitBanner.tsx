import { homeAuthGateActive } from '@reprman/cognito-auth/configureAmplify'
import { useCognitoAuth } from '@reprman/cognito-auth/CognitoAuthContext'
import { isReprsApiConfigured } from '@reprman/reprs-api'
import { useL10n } from '@reprman/localization'
import {
  selectAtReprLimit,
  selectSubscription,
  selectSubscriptionLoaded,
} from '@reprman/state/reprsQuota'
import React from 'react'
import { Alert } from 'react-bootstrap'
import { useSelector } from 'react-redux'

const ReprLimitBanner = () => {
  const { t } = useL10n()
  const { sessionChecked, signedIn } = useCognitoAuth()
  const subscription = useSelector(selectSubscription)
  const subscriptionLoaded = useSelector(selectSubscriptionLoaded)
  const atLimit = useSelector(selectAtReprLimit)

  if (
    !isReprsApiConfigured ||
    (homeAuthGateActive() && (!sessionChecked || !signedIn)) ||
    !subscriptionLoaded ||
    subscription?.maxReprs == null ||
    !atLimit
  ) {
    return null
  }

  return (
    <Alert
      variant="warning"
      className="mb-0 rounded-0 text-center"
      id="repr-limit-banner"
    >
      {t('billing.reprLimitReached', { maxReprs: subscription.maxReprs })}
    </Alert>
  )
}

export default ReprLimitBanner
