import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useReducer } from 'react'
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useDispatch } from 'react-redux'
import { useL10n } from '@reprman/localization'
import {
  getLastPracticedAt,
  isWithinPracticeCooldown,
  PRACTICE_COOLDOWN_MS,
} from '@reprman/shared/repr-rules'
import { markReprPracticedSAC } from '@reprman/state/sagas/reprs/reprs.actions'
import { useReprs } from '@reprman/state/reprs'

export default function ReprDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const dispatch = useDispatch()
  const { t } = useL10n()
  const { getRepr, reprsLoaded } = useReprs()
  const repr = getRepr(id)
  const [, bumpCooldownRender] = useReducer((version: number) => version + 1, 0)

  const practiceOnCooldown = repr
    ? isWithinPracticeCooldown(repr.datesPracticed)
    : false
  const lastPracticed = repr ? getLastPracticedAt(repr.datesPracticed) : 0

  useEffect(() => {
    if (!practiceOnCooldown || !lastPracticed) {
      return undefined
    }
    const remaining = PRACTICE_COOLDOWN_MS - (Date.now() - lastPracticed)
    const timeoutId = setTimeout(bumpCooldownRender, Math.max(remaining, 0))
    return () => clearTimeout(timeoutId)
  }, [lastPracticed, practiceOnCooldown])

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

        <Pressable
          style={[
            styles.practiceButton,
            practiceOnCooldown && styles.buttonDisabled,
          ]}
          disabled={practiceOnCooldown}
          onPress={() => dispatch(markReprPracticedSAC(repr.id))}
        >
          <Text style={styles.practiceButtonText}>
            {t('buttons.practiced')}
          </Text>
        </Pressable>
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
  practiceButton: {
    marginTop: 8,
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  practiceButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
})
