import type { UserConfigItem } from '@reprman/shared/quota'

const MS_PER_DAY = 86_400_000

const readEnvInt = (key: string, fallback: number): number => {
  const raw = typeof process !== 'undefined' ? process.env?.[key] : undefined
  if (raw === undefined || raw === '') {
    return fallback
  }
  const parsed = Number(raw)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback
}

export const DEFAULT_TRIAL_DAYS = readEnvInt('DEFAULT_TRIAL_DAYS', 90)
export const TRIAL_MAX_REPRS = readEnvInt('TRIAL_MAX_REPRS', 100)
export const UNPAID_MAX_REPRS = readEnvInt('UNPAID_MAX_REPRS', 25)
export const PAID_MAX_REPRS = readEnvInt('PAID_MAX_REPRS', 1000)
export const PAID_EXPIRY_WARNING_DAYS = readEnvInt(
  'PAID_EXPIRY_WARNING_DAYS',
  10
)

export type SubscriptionStatus = 'trial' | 'unpaid' | 'paid' | 'unlimited'

export type Subscription = {
  status: SubscriptionStatus
  expiration: string | null
  maxReprs: number | null
}

export type SubscriptionUserConfig = UserConfigItem & {
  trialEndsAtMs?: number
  subscriptionTier?: 'unlimited'
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  stripeSubscriptionStatus?: string
  stripeCurrentPeriodEndMs?: number
  complimentaryPaidUntilMs?: number
}

const STRIPE_PAID_STATUSES = new Set(['active', 'trialing'])

export const isStripeSubscriptionPaid = (status: string | undefined): boolean =>
  Boolean(status && STRIPE_PAID_STATUSES.has(status))

const msToIso = (ms: number): string => new Date(ms).toISOString()

export const resolveSubscription = (
  config: SubscriptionUserConfig | null | undefined,
  nowMs: number = Date.now()
): Subscription => {
  if (config?.subscriptionTier === 'unlimited') {
    return {
      status: 'unlimited',
      expiration: null,
      maxReprs: null,
    }
  }

  const stripePaid = isStripeSubscriptionPaid(config?.stripeSubscriptionStatus)
  const complimentaryPaid =
    typeof config?.complimentaryPaidUntilMs === 'number' &&
    nowMs < config.complimentaryPaidUntilMs

  if (stripePaid || complimentaryPaid) {
    let expiration: string | null = null
    if (stripePaid && typeof config?.stripeCurrentPeriodEndMs === 'number') {
      expiration = msToIso(config.stripeCurrentPeriodEndMs)
    } else if (complimentaryPaid && config?.complimentaryPaidUntilMs) {
      expiration = msToIso(config.complimentaryPaidUntilMs)
    }
    return {
      status: 'paid',
      expiration,
      maxReprs: PAID_MAX_REPRS,
    }
  }

  if (
    typeof config?.trialEndsAtMs === 'number' &&
    nowMs < config.trialEndsAtMs
  ) {
    return {
      status: 'trial',
      expiration: msToIso(config.trialEndsAtMs),
      maxReprs: TRIAL_MAX_REPRS,
    }
  }

  return {
    status: 'unpaid',
    expiration: null,
    maxReprs: UNPAID_MAX_REPRS,
  }
}

/** Whole days remaining until `expirationIso` (ceil partial days). */
export const daysUntilExpiration = (
  expirationIso: string | null | undefined,
  nowMs: number = Date.now()
): number | null => {
  if (!expirationIso) {
    return null
  }
  const endMs = Date.parse(expirationIso)
  if (!Number.isFinite(endMs)) {
    return null
  }
  const diff = endMs - nowMs
  if (diff <= 0) {
    return 0
  }
  return Math.ceil(diff / MS_PER_DAY)
}

export const isAtReprLimit = (
  reprCount: number,
  subscription: Subscription
): boolean =>
  subscription.maxReprs !== null && reprCount >= subscription.maxReprs

export const shouldShowPaidExpiryWarning = (
  subscription: Subscription,
  nowMs: number = Date.now()
): boolean => {
  if (subscription.status !== 'paid' || !subscription.expiration) {
    return false
  }
  const days = daysUntilExpiration(subscription.expiration, nowMs)
  return days !== null && days <= PAID_EXPIRY_WARNING_DAYS
}

export const computeTrialEndsAtMs = (nowMs: number = Date.now()): number =>
  nowMs + DEFAULT_TRIAL_DAYS * MS_PER_DAY
