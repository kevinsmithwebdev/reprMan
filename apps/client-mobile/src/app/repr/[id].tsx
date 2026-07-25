import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
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
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (!repr) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{t('errors.couldNotRemoveRepr')}</Text>
        <Pressable onPress={() => router.replace('/dashboard')}>
          <Text style={styles.link}>{t('buttons.back')}</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <>
      <Stack.Screen options={{ title: repr.title }} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{repr.title}</Text>

        <View style={styles.section}>
          <Text style={styles.label}>{t('pages.viewRepr.data.categories')}</Text>
          <Text style={styles.value}>
            {repr.categories.length > 0
              ? repr.categories.join(', ')
              : t('pages.viewRepr.data.noCategories')}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t('pages.viewRepr.data.comment')}</Text>
          <Text style={styles.value}>
            {repr.comment || t('pages.viewRepr.data.noComment')}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t('pages.viewRepr.data.learning')}</Text>
          <Text style={styles.value}>
            {repr.learning
              ? t('pages.viewRepr.data.learningYes')
              : t('pages.viewRepr.data.learningNo')}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            {t('pages.viewRepr.data.datesPracticed')}
          </Text>
          <Text style={styles.value}>
            {repr.datesPracticed.length > 0
              ? repr.datesPracticed
                  .map((ts) => new Date(ts).toLocaleDateString())
                  .join(', ')
              : t('common.never')}
          </Text>
        </View>
      </ScrollView>
    </>
  )
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
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
  link: {
    marginTop: 16,
    color: '#0a7ea4',
    fontSize: 16,
  },
})
