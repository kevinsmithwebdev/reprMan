import { useRouter } from 'expo-router'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useCognitoSignOut } from '@reprman/cognito-auth'
import { useL10n } from '@reprman/localization'
import { useReprs } from '@reprman/state/reprs'
import { useUser } from '@reprman/state/user/user.hooks'
import type { Repr } from '@reprman/shared/repr-model'

export default function DashboardScreen() {
  const router = useRouter()
  const { t } = useL10n()
  const { user } = useUser()
  const { reprs, reprsLoaded } = useReprs()
  const { busy, handleSignOut } = useCognitoSignOut()

  const onSignOut = async () => {
    await handleSignOut()
    router.replace('/sign-in')
  }

  const renderItem = ({ item }: { item: Repr }) => (
    <Pressable
      style={styles.reprRow}
      onPress={() => router.push(`/repr/${item.id}`)}
    >
      <Text style={styles.reprTitle}>{item.title}</Text>
      {item.categories.length > 0 ? (
        <Text style={styles.reprMeta}>{item.categories.join(', ')}</Text>
      ) : null}
    </Pressable>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>{t('brand.reprMan')}</Text>
          <Text style={styles.body} numberOfLines={1}>
            {user.email || user.name || ''}
          </Text>
        </View>
        <Pressable
          style={[styles.signOutButton, busy && styles.buttonDisabled]}
          disabled={busy}
          onPress={onSignOut}
        >
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.signOutText}>{t('auth.signOut')}</Text>
          )}
        </Pressable>
      </View>

      {!reprsLoaded ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={reprs}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={
            reprs.length === 0 ? styles.emptyList : styles.list
          }
          ListEmptyComponent={
            <Text style={styles.empty}>
              {t('components.reprsList.emptyList')}
            </Text>
          }
          ListHeaderComponent={
            reprs.length > 0 ? (
              <Text style={styles.count}>
                {t('components.reprsList.reprsCountShort', {
                  count: reprs.length,
                })}
              </Text>
            ) : null
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  body: {
    fontSize: 13,
    color: '#555',
  },
  signOutButton: {
    backgroundColor: '#b42318',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 88,
    alignItems: 'center',
  },
  signOutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: 16,
    gap: 8,
  },
  emptyList: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  count: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  reprRow: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 8,
    marginBottom: 8,
    gap: 4,
  },
  reprTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  reprMeta: {
    fontSize: 13,
    color: '#666',
  },
  empty: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
})
