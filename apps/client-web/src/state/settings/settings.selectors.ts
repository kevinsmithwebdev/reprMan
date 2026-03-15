import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { NAMESPACE } from './settings.constants'

export const selectSettings = createSelector(
  (state: RootState) => state[NAMESPACE],
  (data) => data
)
