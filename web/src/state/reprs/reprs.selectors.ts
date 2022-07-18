import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { NAMESPACE } from './reprs.constants'

export const selectReprs = createSelector(
  (state: RootState) => state[NAMESPACE],
  (data) => data.reprs
)

export const selectCategories = createSelector(
  (state: RootState) => state[NAMESPACE],
  (data) => data.categories
)
