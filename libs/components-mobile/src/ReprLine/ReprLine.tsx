import React, { FC, useEffect, useReducer } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Repr } from '@reprman/types'
import { getDateAndFrom } from '@reprman/utilities'
import { useL10n } from '@reprman/localization'
import { useSettings } from '@reprman/state/settings'
import {
  getLastPracticedAt,
  getReprVisualColorsForRepr,
  isWithinPracticeCooldown,
  PRACTICE_COOLDOWN_MS,
} from '@reprman/shared/repr-rules'
import {
  markReprPracticedSAC,
  removeReprSAC,
} from '@reprman/state/sagas/reprs/reprs.actions'
import { useDispatch } from 'react-redux'
import CategoryPills from '../CategoryPills'
import PrimaryButton from '../PrimaryButton'

export type ReprLineProps = {
  repr: Repr
}

const ReprLine: FC<ReprLineProps> = ({ repr }) => {
  const dispatch = useDispatch()
  const { t } = useL10n()
  const { settings } = useSettings()
  const router = useRouter()
  const { title, id, datesPracticed, categories, comment } = repr
  const lastPracticed = getLastPracticedAt(datesPracticed)
  const [, bumpCooldownRender] = useReducer((version: number) => version + 1, 0)
  const practiceOnCooldown = isWithinPracticeCooldown(datesPracticed)
  const colors = getReprVisualColorsForRepr(repr, settings)

  useEffect(() => {
    if (!practiceOnCooldown) return undefined
    const remaining = PRACTICE_COOLDOWN_MS - (Date.now() - lastPracticed)
    const timeoutId = setTimeout(bumpCooldownRender, remaining)
    return () => clearTimeout(timeoutId)
  }, [lastPracticed, practiceOnCooldown])

  return (
    <Pressable
      style={[
        styles.card,
        {
          backgroundColor: colors.backgroundColor,
          borderColor: colors.borderColor,
        },
      ]}
      onPress={() => router.push(`/(app)/repr/${id}/edit`)}
      testID={`repr-line-${id}`}
    >
      <Text style={styles.title}>{title}</Text>
      {!!comment && (
        <Text style={styles.comment}>
          <Text style={styles.label}>{t('pages.viewRepr.data.comment')}: </Text>
          {comment}
        </Text>
      )}
      <Text style={styles.subtitle}>
        <Text style={styles.label}>{t('common.lastPracticed')}: </Text>
        {lastPracticed ? getDateAndFrom(lastPracticed) : t('common.never')}
      </Text>
      {!!categories.length && (
        <View style={styles.pills}>
          <CategoryPills categories={categories} />
        </View>
      )}
      <View style={styles.actions}>
        <PrimaryButton
          label={t('buttons.practiced')}
          variant="success"
          disabled={practiceOnCooldown}
          onPress={() => dispatch(markReprPracticedSAC(id))}
          style={styles.actionButton}
        />
        <PrimaryButton
          label={t('buttons.delete')}
          variant="danger"
          onPress={() => dispatch(removeReprSAC(id))}
          style={styles.actionButton}
        />
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 6,
  },
  comment: {
    fontStyle: 'italic',
    marginBottom: 4,
    color: '#333',
  },
  subtitle: {
    marginBottom: 8,
    color: '#333',
  },
  label: {
    fontWeight: '700',
  },
  pills: {
    marginBottom: 10,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    minHeight: 40,
  },
})

export default ReprLine
