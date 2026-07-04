import React, { FC, ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Screen from '../Screen'

export type AuthScreenProps = {
  title: string
  children: ReactNode
  footer?: ReactNode
}

const AuthScreen: FC<AuthScreenProps> = ({ title, children, footer }) => (
  <Screen scroll testID="auth-screen">
    <Text style={styles.title}>{title}</Text>
    <View style={styles.form}>{children}</View>
    {footer ? <View style={styles.footer}>{footer}</View> : null}
  </Screen>
)

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 24,
    color: '#222',
    textAlign: 'center',
  },
  form: {
    gap: 8,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
    gap: 12,
  },
})

export default AuthScreen
