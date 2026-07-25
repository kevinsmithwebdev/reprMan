import { useRouter } from 'expo-router'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useCognitoSignOut } from '@reprman/cognito-auth'
import { useL10n } from '@reprman/localization'
import { useUser } from '@reprman/state/user/user.hooks'

export default function DashboardScreen() {
  const router = useRouter()
  const { t } = useL10n()
  const { user } = useUser()
  const { busy, handleSignOut } = useCognitoSignOut()

  const onSignOut = async () => {
    await handleSignOut()
    router.replace('/sign-in')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.body}>
        Signed in as {user.email || user.name || 'user'}.
      </Text>
      <Text style={styles.hint}>
        This is a placeholder screen. Repertoire features will land here later.
      </Text>

      <Pressable
        style={[styles.button, busy && styles.buttonDisabled]}
        disabled={busy}
        onPress={onSignOut}
      >
        {busy ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{t('auth.signOut')}</Text>
        )}
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 12,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  body: {
    fontSize: 16,
    color: '#222',
  },
  hint: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  button: {
    marginTop: 16,
    backgroundColor: '#b42318',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
