import { describe, expect, it } from 'vitest'

import type { RootState } from '../store'
import {
  selectNeedsTermsAcceptance,
  selectQuotaLoaded,
  selectReprCreationCapWhenLoaded,
  selectTermsConfigLoaded,
} from './reprsQuota.selectors'

const quotaState = (
  overrides: Partial<RootState['reprsQuota']> = {}
): RootState['reprsQuota'] => ({
  maxReprsAllowed: undefined,
  ...overrides,
})

describe('reprsQuota.selectors', () => {
  it('selectQuotaLoaded is false until maxReprsAllowed is set', () => {
    expect(
      selectQuotaLoaded({ reprsQuota: quotaState() } as RootState)
    ).toBe(false)
    expect(
      selectQuotaLoaded({
        reprsQuota: quotaState({ maxReprsAllowed: 5 }),
      } as RootState)
    ).toBe(true)
    expect(
      selectQuotaLoaded({
        reprsQuota: quotaState({ maxReprsAllowed: null }),
      } as RootState)
    ).toBe(true)
  })

  it('selectReprCreationCapWhenLoaded reflects quota semantics', () => {
    expect(
      selectReprCreationCapWhenLoaded({
        reprsQuota: quotaState(),
      } as RootState)
    ).toBeUndefined()
    expect(
      selectReprCreationCapWhenLoaded({
        reprsQuota: quotaState({ maxReprsAllowed: null }),
      } as RootState)
    ).toBeNull()
    expect(
      selectReprCreationCapWhenLoaded({
        reprsQuota: quotaState({ maxReprsAllowed: 12 }),
      } as RootState)
    ).toBe(12)
  })

  it('selectTermsConfigLoaded tracks currentTermsVersion', () => {
    expect(
      selectTermsConfigLoaded({ reprsQuota: quotaState() } as RootState)
    ).toBe(false)
    expect(
      selectTermsConfigLoaded({
        reprsQuota: quotaState({ currentTermsVersion: '2' }),
      } as RootState)
    ).toBe(true)
    expect(
      selectTermsConfigLoaded({
        reprsQuota: quotaState({ currentTermsVersion: null }),
      } as RootState)
    ).toBe(true)
  })

  it('selectNeedsTermsAcceptance compares versions when loaded', () => {
    expect(
      selectNeedsTermsAcceptance({ reprsQuota: quotaState() } as RootState)
    ).toBe(false)
    expect(
      selectNeedsTermsAcceptance({
        reprsQuota: quotaState({
          currentTermsVersion: null,
          termsVersion: '1',
        }),
      } as RootState)
    ).toBe(false)
    expect(
      selectNeedsTermsAcceptance({
        reprsQuota: quotaState({
          currentTermsVersion: '2',
          termsVersion: '1',
        }),
      } as RootState)
    ).toBe(true)
    expect(
      selectNeedsTermsAcceptance({
        reprsQuota: quotaState({
          currentTermsVersion: '2',
          termsVersion: '2',
        }),
      } as RootState)
    ).toBe(false)
  })
})
