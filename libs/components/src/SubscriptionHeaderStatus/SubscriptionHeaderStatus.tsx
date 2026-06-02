import {
  daysUntilExpiration,
  shouldShowPaidExpiryWarning,
} from '@reprman/shared/subscription'
import { homeAuthGateActive } from '@reprman/cognito-auth/configureAmplify'
import { isReprsApiConfigured, ReprsApiModule } from '@reprman/reprs-api'
import { useCognitoAuth } from '@reprman/cognito-auth/CognitoAuthContext'
import { useL10n } from '@reprman/localization'
import {
  selectSubscription,
  selectSubscriptionLoaded,
} from '@reprman/state/reprsQuota'
import React, { useState } from 'react'
import { Button } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const dayLabel = (
  count: number,
  oneKey: string,
  otherKey: string,
  t: (key: string, opts?: object) => string
) => (count === 1 ? t(oneKey, { count }) : t(otherKey, { count }))

const SubscriptionHeaderStatus = () => {
  const { t } = useL10n()
  const navigate = useNavigate()
  const { sessionChecked, signedIn } = useCognitoAuth()
  const subscription = useSelector(selectSubscription)
  const subscriptionLoaded = useSelector(selectSubscriptionLoaded)
  const [busy, setBusy] = useState(false)

  if (
    !isReprsApiConfigured ||
    (homeAuthGateActive() && (!sessionChecked || !signedIn)) ||
    !subscriptionLoaded ||
    !subscription
  ) {
    return null
  }

  const goSubscribe = () => {
    navigate('/subscribe')
  }

  const startCheckout = async () => {
    setBusy(true)
    try {
      const { url } = await ReprsApiModule.getInstance().createCheckoutSession()
      globalThis.location.assign(url)
    } catch {
      goSubscribe()
    } finally {
      setBusy(false)
    }
  }

  if (subscription.status === 'trial' && subscription.expiration) {
    const days = daysUntilExpiration(subscription.expiration) ?? 0
    return (
      <span className="small text-light" id="subscription-header-status">
        {dayLabel(
          days,
          'billing.header.trialOne',
          'billing.header.trialOther',
          t
        )}
      </span>
    )
  }

  if (subscription.status === 'unpaid') {
    return (
      <div
        className="d-flex flex-wrap align-items-center justify-content-center gap-2"
        id="subscription-header-status"
      >
        <span className="small text-light">{t('billing.header.unpaid')}</span>
        <Button
          variant="outline-light"
          size="sm"
          disabled={busy}
          onClick={() => startCheckout()}
        >
          {t('billing.subscribe')}
        </Button>
      </div>
    )
  }

  if (
    subscription.status === 'paid' &&
    shouldShowPaidExpiryWarning(subscription) &&
    subscription.expiration
  ) {
    const days = daysUntilExpiration(subscription.expiration) ?? 0
    return (
      <div
        className="d-flex flex-wrap align-items-center justify-content-center gap-2"
        id="subscription-header-status"
      >
        <span className="small text-light">
          {dayLabel(
            days,
            'billing.header.expiringOne',
            'billing.header.expiringOther',
            t
          )}
        </span>
        <Button
          variant="outline-light"
          size="sm"
          disabled={busy}
          onClick={() => startCheckout()}
        >
          {t('billing.subscribe')}
        </Button>
      </div>
    )
  }

  return null
}

export default SubscriptionHeaderStatus
