import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useL10n } from '@reprman/localization'
import { useReprs } from '@reprman/state/reprs'

export default function ReprDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { t } = useL10n()
  const { getRepr, reprsLoaded } = useReprs()
  const repr = getRepr(id)

  if (!reprsLoaded) {
    return (
      <View style={styles.container}>
        <Text style={styles.meta}>{t('common.loading')}</Text>
      </View>
    )
  }

  if (!repr) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{t('errors.reprNotFound')}</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.link}>{t('auth.signUpBackHome')}</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <>
      <Stack.Screen options={{ title: repr.title }} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{repr.title}</Text>

        {repr.categories.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.label}>{t('controls.categories')}</Text>
            <Text style={styles.value}>{repr.categories.join(', ')}</Text>
          </View>
        ) : null}

        {repr.comment ? (
          <View style={styles.section}>
            <Text style={styles.label}>{t('controls.comment')}</Text>
            <Text style={styles.value}>{repr.comment}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.label}>{t('controls.learning')}</Text>
          <Text style={styles.value}>
            {repr.learning ? t('common.yes') : t('common.no')}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t('controls.datesPracticed')}</Text>
          <Text style={styles.value}>
            {repr.datesPracticed.length > 0
              ? repr.datesPracticed
                  .map((ts) => new Date(ts).toLocaleDateString())
                  .join(', ')
              : '—'}
          </Text>
        </View>
      </ScrollView>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 16,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
  },
  section: {
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 16,
    color: '#222',
    lineHeight: 22,
  },
  meta: {
    fontSize: 15,
    color: '#666',
  },
  link: {
    marginTop: 16,
    color: '#0a7ea4',
    fontSize: 16,
  },
})
