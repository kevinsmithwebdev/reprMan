import { Link, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import {
  ActivityIndicator,
  Linking,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native'
import { TERMS_VERSION } from '@reprman/constants'
import { isCognitoConfigured, useCognitoSignUp } from '@reprman/cognito-auth'
import { useL10n } from '@reprman/localization'
import { isReprsApiConfigured, ReprsApiModule } from '@reprman/reprs-api'

import { authStyles as styles } from '@/constants/auth-styles'

const TERMS_URL = 'https://reprman.com/terms'

export default function SignUpScreen() {
  const router = useRouter()
  const { t } = useL10n()
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const recordTermsAcceptance = useCallback(async () => {
    await ReprsApiModule.getInstance().acceptTerms(TERMS_VERSION)
  }, [])

  const flow = useCognitoSignUp(() => router.replace('/dashboard'), {
    recordTermsAcceptance: isReprsApiConfigured
      ? recordTermsAcceptance
      : undefined,
  })

  if (!isCognitoConfigured()) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{t('pages.signup.title')}</Text>
        <Text style={styles.message}>{t('auth.signUpUnavailable')}</Text>
      </View>
    )
  }

  const handleRegister = () =>
    flow.handleRegister(undefined, {
      acceptedTerms,
      termsRequiredMessage: t('auth.signUpTermsRequired'),
      mismatchMessage: t('auth.signUpPasswordMismatch'),
      codeSentMessage: t('auth.signUpCodeSent'),
      unexpectedNextStepMessage: t('auth.signUpUnexpectedNextStep'),
      unexpectedErrorMessage: t('auth.signUpUnexpectedError'),
      signedInMessage: t('auth.signUpSuccessSignedIn'),
      termsAcceptFailedMessage: t('auth.signUpTermsAcceptFailed'),
    })

  const handleConfirm = () =>
    flow.handleConfirm(undefined, {
      signedInMessage: t('auth.signUpSuccessSignedIn'),
      unexpectedErrorMessage: t('auth.signUpConfirmUnexpectedError'),
      termsAcceptFailedMessage: t('auth.signUpTermsAcceptFailed'),
    })

  const handleResend = () =>
    flow.handleResend({
      resentMessage: t('auth.signUpCodeResent'),
      unexpectedErrorMessage: t('auth.signUpResendUnexpectedError'),
    })

  if (flow.step === 'confirm') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{t('pages.signup.title')}</Text>
        <Text style={styles.message}>
          {t('auth.signUpConfirmIntro', { email: flow.email })}
        </Text>

        <Text style={styles.label}>{t('auth.confirmationCode')}</Text>
        <TextInput
          style={styles.input}
          autoCapitalize="none"
          keyboardType="number-pad"
          value={flow.code}
          onChangeText={flow.setCode}
          editable={!flow.busy}
        />

        <Pressable
          style={[styles.button, flow.busy && styles.buttonDisabled]}
          disabled={flow.busy}
          onPress={handleConfirm}
        >
          {flow.busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {t('auth.signUpConfirmSubmit')}
            </Text>
          )}
        </Pressable>

        <Pressable disabled={flow.busy} onPress={handleResend}>
          <Text style={styles.link}>{t('auth.signUpResendCode')}</Text>
        </Pressable>

        <Pressable
          disabled={flow.busy}
          onPress={() => {
            flow.setStep('register')
            flow.setCode('')
          }}
        >
          <Text style={styles.link}>{t('auth.signUpEditEmail')}</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('pages.signup.title')}</Text>

      <Text style={styles.label}>{t('auth.email')}</Text>
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        value={flow.email}
        onChangeText={flow.setEmail}
        editable={!flow.busy}
      />

      <Text style={styles.label}>{t('auth.password')}</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        autoComplete="new-password"
        value={flow.password}
        onChangeText={flow.setPassword}
        editable={!flow.busy}
      />
      <Text style={styles.hint}>{t('auth.signUpPasswordHint')}</Text>

      <Text style={styles.label}>{t('auth.confirmPassword')}</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        autoComplete="new-password"
        value={flow.confirmPassword}
        onChangeText={flow.setConfirmPassword}
        editable={!flow.busy}
      />

      <Pressable
        style={styles.termsRow}
        disabled={flow.busy}
        onPress={() => setAcceptedTerms((value) => !value)}
      >
        <View
          style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}
        >
          {acceptedTerms ? <Text style={styles.checkmark}>✓</Text> : null}
        </View>
        <Text style={styles.termsText}>
          {t('auth.signUpTermsPrefix')}{' '}
          <Text
            style={styles.linkInline}
            onPress={() => Linking.openURL(TERMS_URL)}
          >
            {t('auth.signUpTermsLink')}
          </Text>
        </Text>
      </Pressable>

      <Pressable
        style={[
          styles.button,
          (flow.busy || !acceptedTerms) && styles.buttonDisabled,
        ]}
        disabled={flow.busy || !acceptedTerms}
        onPress={handleRegister}
      >
        {flow.busy ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{t('auth.signUpSubmit')}</Text>
        )}
      </Pressable>

      <Link href="/sign-in" style={styles.link}>
        {t('auth.signInButton')}
      </Link>
    </View>
  )
}
