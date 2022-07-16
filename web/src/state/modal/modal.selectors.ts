import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { NAMESPACE } from './modal.constants'

export const selectModal = createSelector(
  (state: RootState) => state[NAMESPACE],
  (data) => {
    console.log('asdf data', data)
    return data
  }
)
