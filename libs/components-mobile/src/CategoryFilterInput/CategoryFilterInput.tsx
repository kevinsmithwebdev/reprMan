import React, { FC } from 'react'
import { StyleSheet } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { useL10n } from '@reprman/localization'
import {
  selectCategoryFilter,
  setCategoryFilterText,
} from '@reprman/state/categories'
import TextField from '../TextField'

const CategoryFilterInput: FC = () => {
  const { t } = useL10n()
  const dispatch = useDispatch()
  const filter = useSelector(selectCategoryFilter)

  return (
    <TextField
      placeholder={t('components.categoryFilter.titleTextPlaceholder')}
      value={filter.text}
      onChangeText={(value) => dispatch(setCategoryFilterText(value))}
      style={styles.input}
      testID="category-filter-input"
    />
  )
}

const styles = StyleSheet.create({
  input: {
    marginBottom: 8,
  },
})

export default CategoryFilterInput
