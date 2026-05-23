import { createReducer } from '@reduxjs/toolkit'
import {
  resetMaxReprsQuota,
  setMaxReprsQuota,
  setTermsConfig,
} from './reprsQuota.actions'
import type { ReprsQuotaState } from './reprsQuota.types'

const initialState: ReprsQuotaState = {
  maxReprsAllowed: undefined,
}

export default createReducer(initialState, (builder) => {
  builder.addCase(setMaxReprsQuota, (state, { payload }) => ({
    ...state,
    maxReprsAllowed: payload,
  }))
  builder.addCase(setTermsConfig, (state, { payload }) => ({
    ...state,
    ...payload,
  }))
  builder.addCase(resetMaxReprsQuota, () => initialState)
})
