import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { NAMESPACE } from './modal.constants'

export const selectModal = createSelector(
  (state: RootState) => state[NAMESPACE],
  (data) => data
)
