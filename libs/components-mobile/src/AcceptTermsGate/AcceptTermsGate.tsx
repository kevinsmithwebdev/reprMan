import React, { FC } from 'react'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { useAcceptTermsGate } from '@reprman/cognito-auth'
import { useL10n } from '@reprman/localization'
import PrimaryButton from '../PrimaryButton'

const AcceptTermsGate: FC = () => {
  const { t } = useL10n()
  const { show, accepted, setAccepted, busy, handleAccept } =
    useAcceptTermsGate()

  return (
    <Modal visible={show} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{t('auth.acceptTermsTitle')}</Text>
          <Text style={styles.body}>{t('auth.acceptTermsIntro')}</Text>
          <Pressable
            style={styles.termsRow}
            onPress={() => setAccepted((value) => !value)}
          >
            <View style={[styles.checkbox, accepted && styles.checkboxOn]} />
            <Text style={styles.termsText}>{t('auth.signUpTermsPrefix')}</Text>
          </Pressable>
          <PrimaryButton
            label={t('auth.acceptTermsSubmit')}
            disabled={!accepted}
            busy={busy}
            onPress={() => handleAccept()}
            testID="accept-terms-submit"
          />
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#222',
  },
  body: {
    color: '#333',
    lineHeight: 22,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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

export default AcceptTermsGate
