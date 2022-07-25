import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { NAMESPACE } from './categories.constants'

export const selectCategories = createSelector(
  (state: RootState) => state[NAMESPACE],
  (data) => data
)
