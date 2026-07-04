import {
  ConditionalCheckFailedException,
  DynamoDBClient,
} from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  PutCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb'
import { analyticsEnvironment, serverConfig } from './config'

type ActionType = 'create' | 'edit' | 'delete' | 'practice'

const usageTableName = serverConfig.dailyUsageTableName
const usageTtlDays = 120

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}))

const getDayKey = (date: Date): string => date.toISOString().slice(0, 10)

const toEpochSeconds = (date: Date): number => Math.floor(date.getTime() / 1000)

const trackMetric = (
  metricName: string,
  value: number,
  dimensions: Record<string, string>
) => {
  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify({
      _aws: {
        Timestamp: Date.now(),
        CloudWatchMetrics: [
          {
            Namespace: 'ReprMan/Product',
            Dimensions: [Object.keys(dimensions)],
            Metrics: [{ Name: metricName, Unit: 'Count' }],
          },
        ],
      },
      ...dimensions,
      [metricName]: value,
    })
  )
}

export const trackAction = (action: ActionType): void => {
  trackMetric('ActionCount', 1, {
    Action: action,
    Environment: analyticsEnvironment(),
  })
}

export const trackDailyUniqueUser = async (userId: string): Promise<void> => {
  const now = new Date()
  const day = getDayKey(now)
  const ttl = toEpochSeconds(
    new Date(now.getTime() + usageTtlDays * 24 * 60 * 60 * 1000)
  )

  try {
    await client.send(
      new UpdateCommand({
        TableName: usageTableName,
        Key: {
          pk: `USER#${userId}`,
          sk: 'LAST_ACTIVE',
        },
        UpdateExpression: 'SET activeAtMs = :now, expiresAt = :ttl',
        ExpressionAttributeValues: {
          ':now': now.getTime(),
          ':ttl': ttl,
        },
      })
    )
  } catch (error) {
    console.warn('[analytics] failed to update last active time', error)
  }

  try {
    await client.send(
      new PutCommand({
        TableName: usageTableName,
        Item: {
          pk: `DAY#${day}`,
          sk: `USER#${userId}`,
          expiresAt: ttl,
        },
        ConditionExpression:
          'attribute_not_exists(pk) AND attribute_not_exists(sk)',
      })
    )

    trackMetric('DailyUniqueVisitors', 1, {
      Environment: analyticsEnvironment(),
    })
  } catch (error) {
    if (error instanceof ConditionalCheckFailedException) {
      return
    }

    console.warn('[analytics] failed to write daily unique user', error)
  }
}
