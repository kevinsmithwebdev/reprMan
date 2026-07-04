import React, { FC } from 'react'
import { Pressable, StyleSheet, Text } from 'react-native'
import { useRouter } from 'expo-router'
import { useCognitoSignIn } from '@reprman/cognito-auth'
import { useCognitoAuth } from '@reprman/cognito-auth/CognitoAuthContext'
import { useL10n } from '@reprman/localization'
import AuthScreen from '../AuthScreen'
import PrimaryButton from '../PrimaryButton'
import TextField from '../TextField'

const SignInForm: FC = () => {
  const { t } = useL10n()
  const router = useRouter()
  const { refreshSession } = useCognitoAuth()
  const { email, setEmail, password, setPassword, busy, handleSignIn } =
    useCognitoSignIn(refreshSession, () => router.replace('/(app)'))

  return (
    <AuthScreen
      title={t('pages.signin.title')}
      footer={
        <>
          <Pressable onPress={() => router.push('/(auth)/sign-up')}>
            <Text style={styles.link}>{t('auth.signUpButton')}</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/(auth)/forgot-password')}>
            <Text style={styles.link}>{t('auth.forgotPasswordLink')}</Text>
          </Pressable>
        </>
      }
    >
      <TextField
        label={t('auth.email')}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        testID="sign-in-email"
      />
      <TextField
        label={t('auth.password')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="password"
        testID="sign-in-password"
      />
      <PrimaryButton
        label={t('auth.signInButton')}
        onPress={() =>
          handleSignIn({ preventDefault: () => {} } as React.FormEvent)
        }
        busy={busy}
        testID="sign-in-submit"
      />
    </AuthScreen>
  )
}

const styles = StyleSheet.create({
  link: {
    color: '#0c63e4',
    fontWeight: '600',
    fontSize: 15,
  },
})

export default SignInForm
