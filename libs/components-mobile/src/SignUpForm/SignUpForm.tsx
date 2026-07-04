import React, { FC, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { TERMS_VERSION } from '@reprman/constants'
import { useCognitoSignUp } from '@reprman/cognito-auth'
import { isReprsApiConfigured, ReprsApiModule } from '@reprman/reprs-api'
import { useL10n } from '@reprman/localization'
import AuthScreen from '../AuthScreen'
import PrimaryButton from '../PrimaryButton'
import TextField from '../TextField'

const SignUpForm: FC = () => {
  const { t } = useL10n()
  const router = useRouter()
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const {
    step,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    code,
    setCode,
    busy,
    handleRegister,
    handleConfirm,
    handleResend,
  } = useCognitoSignUp(() => router.replace('/(app)'), {
    recordTermsAcceptance: isReprsApiConfigured
      ? () => ReprsApiModule.getInstance().acceptTerms(TERMS_VERSION)
      : undefined,
  })

  if (step === 'confirm') {
    return (
      <AuthScreen title={t('pages.signup.title')}>
        <TextField
          label={t('auth.confirmationCode')}
          value={code}
          onChangeText={setCode}
          autoCapitalize="none"
          testID="sign-up-code"
        />
        <PrimaryButton
          label={t('auth.signUpConfirmSubmit')}
          onPress={() =>
            handleConfirm({ preventDefault: () => {} } as React.FormEvent, {
              signedInMessage: t('auth.signUpSuccessSignedIn'),
              unexpectedErrorMessage: t('auth.signUpConfirmUnexpectedError'),
              termsAcceptFailedMessage: t('auth.signUpTermsAcceptFailed'),
            })
          }
          busy={busy}
          testID="sign-up-confirm-submit"
        />
        <PrimaryButton
          label={t('auth.signUpResendCode')}
          variant="primary"
          onPress={() =>
            handleResend({
              resentMessage: t('auth.signUpCodeResent'),
              unexpectedErrorMessage: t('auth.signUpResendUnexpectedError'),
            })
          }
          busy={busy}
        />
      </AuthScreen>
    )
  }

  return (
    <AuthScreen
      title={t('pages.signup.title')}
      footer={
        <Pressable onPress={() => router.push('/(auth)/sign-in')}>
          <Text style={styles.link}>{t('auth.signIn')}</Text>
        </Pressable>
      }
    >
      <TextField
        label={t('auth.email')}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        testID="sign-up-email"
      />
      <TextField
        label={t('auth.password')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        testID="sign-up-password"
      />
      <TextField
        label={t('auth.confirmPassword')}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        testID="sign-up-confirm-password"
      />
      <Pressable
        style={styles.termsRow}
        onPress={() => setAcceptedTerms((value) => !value)}
      >
        <View style={[styles.checkbox, acceptedTerms && styles.checkboxOn]} />
        <Text style={styles.termsText}>{t('auth.signUpTermsPrefix')}</Text>
      </Pressable>
      <PrimaryButton
        label={t('auth.signUpSubmit')}
        onPress={() =>
          handleRegister({ preventDefault: () => {} } as React.FormEvent, {
            acceptedTerms,
            termsRequiredMessage: t('auth.signUpTermsRequired'),
            mismatchMessage: t('auth.signUpPasswordMismatch'),
            codeSentMessage: t('auth.signUpCodeSent'),
            unexpectedNextStepMessage: t('auth.signUpUnexpectedNextStep'),
            unexpectedErrorMessage: t('auth.signUpUnexpectedError'),
            signedInMessage: t('auth.signUpSuccessSignedIn'),
            termsAcceptFailedMessage: t('auth.signUpTermsAcceptFailed'),
          })
        }
        busy={busy}
        testID="sign-up-submit"
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
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 4,
  },
  checkboxOn: {
    backgroundColor: '#0c63e4',
    borderColor: '#0c63e4',
  },
  termsText: {
    flex: 1,
    color: '#333',
  },
})

export default SignUpForm
