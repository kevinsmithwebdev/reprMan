import { createAction } from '@reduxjs/toolkit'
import type { Subscription } from '@reprman/shared/subscription'
import { NAMESPACE } from './reprsQuota.constants'

/** From API: number = cap, null = unlimited. undefined clears (use client default). */
export const setMaxReprsQuota = createAction<number | null | undefined>(
  `${NAMESPACE}/SET_MAX_REPRS`
)

export const setSubscription = createAction<Subscription | undefined>(
  `${NAMESPACE}/SET_SUBSCRIPTION`
)

export const setTermsConfig = createAction<{
  termsAcceptedAt: string | null
  termsVersion: string | null
  currentTermsVersion: string | null
}>(`${NAMESPACE}/SET_TERMS`)

export const resetMaxReprsQuota = createAction(`${NAMESPACE}/RESET`)
