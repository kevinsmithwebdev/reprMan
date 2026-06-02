import { describe, expect, it } from 'vitest'

import reducer from './reprsQuota.reducer'
import {
  resetMaxReprsQuota,
  setMaxReprsQuota,
  setTermsConfig,
} from './reprsQuota.actions'

const initialState = { maxReprsAllowed: undefined }

describe('reprsQuota.reducer', () => {
  it('returns initial state for unknown action', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState)
  })

  it('setMaxReprsQuota sets the cap', () => {
    expect(reducer(initialState, setMaxReprsQuota(10))).toEqual({
      maxReprsAllowed: 10,
    })
    expect(reducer(initialState, setMaxReprsQuota(null))).toEqual({
      maxReprsAllowed: null,
    })
  })

  it('setTermsConfig merges terms fields', () => {
    const next = reducer(
      initialState,
      setTermsConfig({
        termsAcceptedAt: '2024-01-01',
        termsVersion: '1',
        currentTermsVersion: '2',
      })
    )
    expect(next).toEqual({
      maxReprsAllowed: undefined,
      termsAcceptedAt: '2024-01-01',
      termsVersion: '1',
      currentTermsVersion: '2',
    })
  })

  it('resetMaxReprsQuota restores initial state', () => {
    const state = {
      maxReprsAllowed: 5,
      termsVersion: '1',
    }
    expect(reducer(state, resetMaxReprsQuota())).toEqual(initialState)
  })
})
