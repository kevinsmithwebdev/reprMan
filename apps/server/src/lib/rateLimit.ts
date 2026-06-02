import {
  ConditionalCheckFailedException,
  DynamoDBClient,
} from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb'

type Window = 'hour' | 'day'

export type RateLimitAction =
  | 'read'
  | 'write'
  | 'practice'
  | 'billingSession'
  | 'terms'

type LimitDefinition = {
  key: string
  window: Window
  max: number
  actionScope: 'global' | RateLimitAction
}

export type RateLimitExceeded = {
  key: string
  max: number
  window: Window
  retryAfterSeconds: number
}

const usageTableName = process.env.DAILY_USAGE_TABLE_NAME ?? ''
const client = DynamoDBDocumentClient.from(new DynamoDBClient({}))

const readIntEnv = (name: string, fallback: number): number => {
  const raw = process.env[name]
  if (!raw?.trim()) {
    return fallback
  }
  const parsed = Number.parseInt(raw, 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

const toEpochSeconds = (date: Date): number => Math.floor(date.getTime() / 1000)

const formatHourBucket = (date: Date): string => date.toISOString().slice(0, 13)
const formatDayBucket = (date: Date): string => date.toISOString().slice(0, 10)

const secondsUntilNextHour = (date: Date): number => {
  const next = new Date(date)
  next.setUTCMinutes(0, 0, 0)
  next.setUTCHours(next.getUTCHours() + 1)
  return Math.max(1, toEpochSeconds(next) - toEpochSeconds(date))
}

const secondsUntilNextDay = (date: Date): number => {
  const next = new Date(date)
  next.setUTCHours(24, 0, 0, 0)
  return Math.max(1, toEpochSeconds(next) - toEpochSeconds(date))
}

const getRetryAfterSeconds = (date: Date, window: Window): number =>
  window === 'hour' ? secondsUntilNextHour(date) : secondsUntilNextDay(date)

const getBucketKey = (date: Date, window: Window): string =>
  window === 'hour' ? formatHourBucket(date) : formatDayBucket(date)

const buildLimits = (action: RateLimitAction): LimitDefinition[] => {
  const globalPerDay = readIntEnv('RATE_LIMIT_GLOBAL_PER_DAY', 1000)
  const map: Record<
    RateLimitAction,
    { hourEnv: string; hourDefault: number; dayEnv: string; dayDefault: number }
  > = {
    read: {
      hourEnv: 'RATE_LIMIT_READ_PER_HOUR',
      hourDefault: 300,
      dayEnv: 'RATE_LIMIT_READ_PER_DAY',
      dayDefault: 3000,
    },
    write: {
      hourEnv: 'RATE_LIMIT_WRITE_PER_HOUR',
      hourDefault: 60,
      dayEnv: 'RATE_LIMIT_WRITE_PER_DAY',
      dayDefault: 500,
    },
    practice: {
      hourEnv: 'RATE_LIMIT_PRACTICE_PER_HOUR',
      hourDefault: 120,
      dayEnv: 'RATE_LIMIT_PRACTICE_PER_DAY',
      dayDefault: 800,
    },
    billingSession: {
      hourEnv: 'RATE_LIMIT_BILLING_SESSION_PER_HOUR',
      hourDefault: 10,
      dayEnv: 'RATE_LIMIT_BILLING_SESSION_PER_DAY',
      dayDefault: 30,
    },
    terms: {
      hourEnv: 'RATE_LIMIT_TERMS_PER_HOUR',
      hourDefault: 20,
      dayEnv: 'RATE_LIMIT_TERMS_PER_DAY',
      dayDefault: 50,
    },
  }

  const actionLimits = map[action]
  const limits: LimitDefinition[] = [
    {
      key: 'global/day',
      window: 'day',
      max: globalPerDay,
      actionScope: 'global',
    },
    {
      key: `${action}/hour`,
      window: 'hour',
      max: readIntEnv(actionLimits.hourEnv, actionLimits.hourDefault),
      actionScope: action,
    },
    {
      key: `${action}/day`,
      window: 'day',
      max: readIntEnv(actionLimits.dayEnv, actionLimits.dayDefault),
      actionScope: action,
    },
  ]
  return limits.filter((limit) => limit.max > 0)
}

const consumeLimit = async (
  userId: string,
  limit: LimitDefinition,
  now: Date
): Promise<RateLimitExceeded | null> => {
  if (!usageTableName) {
    return null
  }

  const bucket = getBucketKey(now, limit.window)
  const retryAfterSeconds = getRetryAfterSeconds(now, limit.window)
  const ttl = toEpochSeconds(
    new Date(now.getTime() + (retryAfterSeconds + 2 * 24 * 60 * 60) * 1000)
  )
  const actionScope =
    limit.actionScope === 'global' ? 'GLOBAL' : limit.actionScope

  try {
    await client.send(
      new UpdateCommand({
        TableName: usageTableName,
        Key: {
          pk: `RL#USER#${userId}#W#${limit.window}#B#${bucket}`,
          sk: `ACTION#${actionScope}`,
        },
        UpdateExpression: 'ADD #count :inc SET expiresAt = :ttl',
        ConditionExpression: 'attribute_not_exists(#count) OR #count < :limit',
        ExpressionAttributeNames: {
          '#count': 'requestCount',
        },
        ExpressionAttributeValues: {
          ':inc': 1,
          ':limit': limit.max,
          ':ttl': ttl,
        },
      })
    )
    return null
  } catch (error) {
    if (error instanceof ConditionalCheckFailedException) {
      return {
        key: limit.key,
        max: limit.max,
        window: limit.window,
        retryAfterSeconds,
      }
    }
    throw error
  }
}

export const enforceUserActionRateLimit = async (
  userId: string,
  action: RateLimitAction,
  now: Date = new Date()
): Promise<RateLimitExceeded | null> => {
  const limits = buildLimits(action)
  return limits.reduce<Promise<RateLimitExceeded | null>>(
    async (accPromise, limit) => {
      const existing = await accPromise
      if (existing) {
        return existing
      }
      return consumeLimit(userId, limit, now)
    },
    Promise.resolve(null)
  )
}
