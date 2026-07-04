import {
  ConditionalCheckFailedException,
  DynamoDBClient,
} from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { getRateLimits, serverConfig } from './config'

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

const usageTableName = serverConfig.dailyUsageTableName
const client = DynamoDBDocumentClient.from(new DynamoDBClient({}))

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
  const {
    globalPerDay,
    readPerHour,
    readPerDay,
    writePerHour,
    writePerDay,
    practicePerHour,
    practicePerDay,
    billingSessionPerHour,
    billingSessionPerDay,
    termsPerHour,
    termsPerDay,
  } = getRateLimits()

  const map: Record<RateLimitAction, { hourMax: number; dayMax: number }> = {
    read: { hourMax: readPerHour, dayMax: readPerDay },
    write: { hourMax: writePerHour, dayMax: writePerDay },
    practice: { hourMax: practicePerHour, dayMax: practicePerDay },
    billingSession: {
      hourMax: billingSessionPerHour,
      dayMax: billingSessionPerDay,
    },
    terms: { hourMax: termsPerHour, dayMax: termsPerDay },
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
      max: actionLimits.hourMax,
      actionScope: action,
    },
    {
      key: `${action}/day`,
      window: 'day',
      max: actionLimits.dayMax,
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
