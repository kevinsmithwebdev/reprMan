import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { NAMESPACE } from './toasts.constants'

export const selectToasts = createSelector(
  (state: RootState) => state[NAMESPACE],
  (data) => data
)
