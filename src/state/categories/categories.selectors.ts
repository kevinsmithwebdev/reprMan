import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { NAMESPACE } from './categories.constants'

export const selectCategories = createSelector(
  (state: RootState) => state[NAMESPACE],
  (data) => data.categories
)

export const selectCategoryFilter = createSelector(
  (state: RootState) => state[NAMESPACE],
  (data) => data.filter
)
