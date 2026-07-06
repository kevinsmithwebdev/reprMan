export type ServerStage = 'dev' | 'prod' | 'unknown'

const readRequired = (name: string): string => {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`${name} is required`)
  }
  return value
}

const readOptional = (name: string): string | undefined => {
  const value = process.env[name]?.trim()
  return value || undefined
}

const readInt = (name: string, fallback: number): number => {
  const raw = process.env[name]
  if (!raw?.trim()) {
    return fallback
  }
  const parsed = Number.parseInt(raw, 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

export const getServerStage = (): ServerStage =>
  (process.env.STAGE?.trim() || 'unknown') as ServerStage

export const getReprsTableName = (): string => readRequired('REPRS_TABLE_NAME')

export const getDailyUsageTableName = (): string =>
  readRequired('DAILY_USAGE_TABLE_NAME')

export const STRIPE_CUSTOMER_INDEX_NAME = 'StripeCustomerIndex'

export const getStripeSecretKey = (): string | undefined =>
  readOptional('STRIPE_SECRET_KEY')

export const getStripeWebhookSecret = (): string | undefined =>
  readOptional('STRIPE_WEBHOOK_SECRET')

export const getStripePriceId = (): string | undefined =>
  readOptional('STRIPE_PRICE_ID')

export const getStripeCheckoutSuccessUrl = (): string | undefined =>
  readOptional('STRIPE_CHECKOUT_SUCCESS_URL')

export const getStripeCheckoutCancelUrl = (): string | undefined =>
  readOptional('STRIPE_CHECKOUT_CANCEL_URL')

export const getStripePortalReturnUrl = (): string | undefined =>
  readOptional('STRIPE_PORTAL_RETURN_URL')

export const getBuildInfo = () => ({
  version: process.env.APP_VERSION?.trim() || 'unknown',
  buildNumber: process.env.APP_BUILD_NUMBER?.trim() || 'local',
  buildTimeUtc: process.env.APP_BUILD_TIME_UTC?.trim() || 'unknown',
  gitSha: process.env.APP_GIT_SHA?.trim() || 'unknown',
})

export const getRateLimits = () => ({
  globalPerDay: readInt('RATE_LIMIT_GLOBAL_PER_DAY', 1000),
  readPerHour: readInt('RATE_LIMIT_READ_PER_HOUR', 300),
  readPerDay: readInt('RATE_LIMIT_READ_PER_DAY', 3000),
  writePerHour: readInt('RATE_LIMIT_WRITE_PER_HOUR', 60),
  writePerDay: readInt('RATE_LIMIT_WRITE_PER_DAY', 500),
  practicePerHour: readInt('RATE_LIMIT_PRACTICE_PER_HOUR', 120),
  practicePerDay: readInt('RATE_LIMIT_PRACTICE_PER_DAY', 800),
  billingSessionPerHour: readInt('RATE_LIMIT_BILLING_SESSION_PER_HOUR', 10),
  billingSessionPerDay: readInt('RATE_LIMIT_BILLING_SESSION_PER_DAY', 30),
  termsPerHour: readInt('RATE_LIMIT_TERMS_PER_HOUR', 20),
  termsPerDay: readInt('RATE_LIMIT_TERMS_PER_DAY', 50),
})

export const analyticsEnvironment = (): string => getServerStage()

/** Resolved at first access (Lambda cold start), not at module import (CDK synth). */
let cachedServerConfig:
  | {
      reprsTableName: string
      dailyUsageTableName: string
      stripeCustomerIndexName: typeof STRIPE_CUSTOMER_INDEX_NAME
    }
  | undefined

export const getServerConfig = () => {
  cachedServerConfig ??= {
    reprsTableName: getReprsTableName(),
    dailyUsageTableName: getDailyUsageTableName(),
    stripeCustomerIndexName: STRIPE_CUSTOMER_INDEX_NAME,
  }
  return cachedServerConfig
}

export const serverConfig = {
  get reprsTableName(): string {
    return getServerConfig().reprsTableName
  },
  get dailyUsageTableName(): string {
    return getServerConfig().dailyUsageTableName
  },
  get stripeCustomerIndexName(): typeof STRIPE_CUSTOMER_INDEX_NAME {
    return getServerConfig().stripeCustomerIndexName
  },
}
