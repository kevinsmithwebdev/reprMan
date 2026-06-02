import { createSelector } from '@reduxjs/toolkit'
import { Reprs } from '@reprman/types'
import { RootState } from '../store'
import { NAMESPACE } from './reprs.constants'

const selectReprsState = (state: RootState) => state[NAMESPACE]

export const selectReprs = createSelector(
  selectReprsState,
  (data) => data || ([] as Reprs)
)

export const selectReprsLoaded = createSelector(
  selectReprsState,
  (data) => data !== null
)
