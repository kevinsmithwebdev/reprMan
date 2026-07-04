import React, { FC } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useL10n } from '@reprman/localization'
import Screen from '../Screen'

const AuthUnavailableCard: FC = () => {
  const { t } = useL10n()
  const messageKey =
    typeof __DEV__ !== 'undefined' && __DEV__
      ? 'auth.homeCognitoEnvMissingDev'
      : 'auth.homeCognitoEnvMissingProd'

  return (
    <Screen testID="auth-unavailable-card">
      <View style={styles.card}>
        <Text style={styles.title}>{t('auth.homeSignedOutTitle')}</Text>
        <Text style={styles.body}>{t(messageKey)}</Text>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12,
    color: '#222',
    textAlign: 'center',
  },
  body: {
    color: '#444',
    lineHeight: 22,
    textAlign: 'center',
  },
})

export default AuthUnavailableCard
