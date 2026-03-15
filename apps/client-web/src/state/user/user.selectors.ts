import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { NAMESPACE } from './user.constants'

export const selectUser = createSelector(
  (state: RootState) => state[NAMESPACE],
  (data) => {
    return data
  }
)
