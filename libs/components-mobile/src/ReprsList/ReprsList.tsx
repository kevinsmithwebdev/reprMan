import React, { FC, useMemo } from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import {
  groupReprsByStatus,
  REPR_STATUS_SECTION_TITLE_KEYS,
} from '@reprman/shared/repr-rules'
import { useL10n } from '@reprman/localization'
import { useSettings } from '@reprman/state/settings'
import { Repr } from '@reprman/types'
import ReprLine from '../ReprLine'

export type ReprsListProps = {
  reprs: Repr[]
}

type ListItem =
  | { type: 'header'; key: string; title: string }
  | { type: 'repr'; key: string; repr: Repr }

const ReprsList: FC<ReprsListProps> = ({ reprs }) => {
  const { t } = useL10n()
  const { settings } = useSettings()
  const sections = useMemo(
    () => groupReprsByStatus(reprs, settings),
    [reprs, settings]
  )

  const items = useMemo(
    () =>
      sections.flatMap((section) => {
        const header: ListItem = {
          type: 'header',
          key: `header-${section.status}`,
          title: t(REPR_STATUS_SECTION_TITLE_KEYS[section.status]),
        }
        const rows: ListItem[] = section.reprs.map((repr) => ({
          type: 'repr',
          key: repr.id,
          repr,
        }))
        return [header, ...rows]
      }),
    [sections, t]
  )

  if (!reprs.length) {
    return (
      <View style={styles.empty} testID="reprs-list-empty">
        <Text style={styles.emptyText}>
          {t('components.reprsList.emptyList')}
        </Text>
      </View>
    )
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.key}
      renderItem={({ item }) =>
        item.type === 'header' ? (
          <Text style={styles.sectionTitle}>{item.title}</Text>
        ) : (
          <ReprLine repr={item.repr} />
        )
      }
      contentContainerStyle={styles.list}
      testID="reprs-list"
    />
  )
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 8,
    color: '#222',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
  },
})

export default ReprsList
