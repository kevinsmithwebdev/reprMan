import React, { FC } from 'react'
import { Pressable, StyleSheet, Text } from 'react-native'
import { useRouter } from 'expo-router'
import { useCognitoForgotPassword } from '@reprman/cognito-auth'
import { useL10n } from '@reprman/localization'
import AuthScreen from '../AuthScreen'
import PrimaryButton from '../PrimaryButton'
import TextField from '../TextField'

const ForgotPasswordForm: FC = () => {
  const { t } = useL10n()
  const router = useRouter()
  const {
    step,
    email,
    setEmail,
    code,
    setCode,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    busy,
    handleRequest,
    handleConfirm,
    handleResend,
  } = useCognitoForgotPassword(() => router.replace('/(auth)/sign-in'))

  if (step === 'confirm') {
    return (
      <AuthScreen title={t('pages.forgotPassword.title')}>
        <TextField
          label={t('auth.confirmationCode')}
          value={code}
          onChangeText={setCode}
          autoCapitalize="none"
        />
        <TextField
          label={t('auth.changePasswordNew')}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />
        <TextField
          label={t('auth.confirmPassword')}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        <PrimaryButton
          label={t('auth.forgotPasswordConfirmSubmit')}
          onPress={() =>
            handleConfirm({ preventDefault: () => {} } as React.FormEvent, {
              mismatchMessage: t('auth.signUpPasswordMismatch'),
              successMessage: t('auth.forgotPasswordSuccess'),
              unexpectedErrorMessage: t(
                'auth.forgotPasswordConfirmUnexpectedError'
              ),
            })
          }
          busy={busy}
        />
        <PrimaryButton
          label={t('auth.signUpResendCode')}
          onPress={() =>
            handleResend({
              resentMessage: t('auth.signUpCodeResent'),
              unexpectedErrorMessage: t('auth.forgotPasswordUnexpectedError'),
            })
          }
          busy={busy}
        />
      </AuthScreen>
    )
  }

  return (
    <AuthScreen
      title={t('pages.forgotPassword.title')}
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
      />
      <PrimaryButton
        label={t('auth.forgotPasswordSendCode')}
        onPress={() =>
          handleRequest({ preventDefault: () => {} } as React.FormEvent, {
            codeSentMessage: t('auth.forgotPasswordCodeSent'),
            successMessage: t('auth.forgotPasswordSuccess'),
            unexpectedNextStepMessage: t(
              'auth.forgotPasswordUnexpectedNextStep'
            ),
            unexpectedErrorMessage: t('auth.forgotPasswordUnexpectedError'),
          })
        }
        busy={busy}
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

export default ForgotPasswordForm
