import React, { FC } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useSelector } from 'react-redux'
import { homeAuthGateActive, isCognitoConfigured } from '@reprman/cognito-auth'
import { useCognitoAuth } from '@reprman/cognito-auth/CognitoAuthContext'
import { isReprsApiConfigured } from '@reprman/reprs-api'
import { useL10n } from '@reprman/localization'
import {
  selectAtReprLimit,
  selectSubscription,
  selectSubscriptionLoaded,
} from '@reprman/state/reprsQuota'

const ReprLimitBanner: FC = () => {
  const { t } = useL10n()
  const { sessionChecked, signedIn } = useCognitoAuth()
  const subscription = useSelector(selectSubscription)
  const subscriptionLoaded = useSelector(selectSubscriptionLoaded)
  const atLimit = useSelector(selectAtReprLimit)

  if (
    !isReprsApiConfigured ||
    (homeAuthGateActive() &&
      isCognitoConfigured() &&
      (!sessionChecked || !signedIn)) ||
    !subscriptionLoaded ||
    subscription?.maxReprs == null ||
    !atLimit
  ) {
    return null
  }

  return (
    <View style={styles.banner} testID="repr-limit-banner">
      <Text style={styles.text}>
        {t('billing.reprLimitReached', { maxReprs: subscription.maxReprs })}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#ffe0b3',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  text: {
    textAlign: 'center',
    color: '#663c00',
    fontWeight: '600',
  },
})

export default ReprLimitBanner
