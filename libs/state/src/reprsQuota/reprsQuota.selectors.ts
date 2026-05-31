import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import { selectReprs } from '../reprs/reprs.selectors'
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

export const selectSubscriptionLoaded = createSelector(
  selectReprQuotaState,
  ({ subscription }) => subscription !== undefined
)

export const selectSubscription = createSelector(
  selectReprQuotaState,
  ({ subscription }) => subscription
)

export const selectAtReprLimit = createSelector(
  selectReprQuotaState,
  selectReprs,
  ({ subscription, maxReprsAllowed }, reprs) => {
    const reprCount = reprs?.length ?? 0
    const cap = subscription?.maxReprs ?? maxReprsAllowed
    if (cap === null || cap === undefined) {
      return false
    }
    return reprCount >= cap
  }
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
