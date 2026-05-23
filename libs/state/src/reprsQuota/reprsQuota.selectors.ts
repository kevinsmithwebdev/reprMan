import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import { NAMESPACE } from './reprsQuota.constants'

const selectReprQuotaState = (state: RootState) => state[NAMESPACE]

export const selectQuotaLoaded = createSelector(
  selectReprQuotaState,
  ({ maxReprsAllowed }) => maxReprsAllowed !== undefined
)

/**
 * When quota is loaded: null = unlimited, number = cap.
 * When not loaded: undefined (caller must not allow creates).
 */
export const selectReprCreationCapWhenLoaded = createSelector(
  selectReprQuotaState,
  ({ maxReprsAllowed }): number | null | undefined => {
    if (maxReprsAllowed === undefined) {
      return undefined
    }
    if (maxReprsAllowed === null) {
      return null
    }
    return maxReprsAllowed
  }
)

export const selectTermsConfigLoaded = createSelector(
  selectReprQuotaState,
  ({ currentTermsVersion }) => currentTermsVersion !== undefined
)

export const selectNeedsTermsAcceptance = createSelector(
  selectReprQuotaState,
  ({ termsVersion, currentTermsVersion }) => {
    if (currentTermsVersion === undefined || currentTermsVersion === null) {
      return false
    }
    return termsVersion !== currentTermsVersion
  }
)
