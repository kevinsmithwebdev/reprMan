import { Link, useRouter } from 'expo-router'
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native'
import {
  isCognitoConfigured,
  useCognitoAuth,
  useCognitoSignIn,
} from '@reprman/cognito-auth'
import { useL10n } from '@reprman/localization'

import { authStyles as styles } from '@/constants/auth-styles'

export default function SignInScreen() {
  const router = useRouter()
  const { t } = useL10n()
  const { sessionChecked, refreshSession } = useCognitoAuth()
  const {
    email,
    setEmail,
    password,
    setPassword,
    busy,
    handleSignIn,
    t: tForm,
  } = useCognitoSignIn(refreshSession, () => router.replace('/dashboard'))

  if (isCognitoConfigured() && !sessionChecked) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (!isCognitoConfigured()) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{t('pages.signin.title')}</Text>
        <Text style={styles.message}>{tForm('auth.signInUnavailable')}</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('pages.signin.title')}</Text>

      <Text style={styles.label}>{tForm('auth.email')}</Text>
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        editable={!busy}
      />

      <Text style={styles.label}>{tForm('auth.password')}</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        autoComplete="password"
        value={password}
        onChangeText={setPassword}
        editable={!busy}
      />

      <Pressable
        style={[styles.button, busy && styles.buttonDisabled]}
        disabled={busy}
        onPress={() => handleSignIn()}
      >
        {busy ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{tForm('auth.signInButton')}</Text>
        )}
      </Pressable>

      <Link href="/sign-up" style={styles.link}>
        {tForm('auth.signUpButton')}
      </Link>
    </View>
  )
}
