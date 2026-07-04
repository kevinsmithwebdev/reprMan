import {
  ConditionalCheckFailedException,
  DynamoDBClient,
} from '@aws-sdk/client-dynamodb'
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb'
import type { Repr } from '@reprman/shared/repr-model'
import type { PracticeSettings, UserConfigItem } from '@reprman/shared/quota'
import { computeTrialEndsAtMs } from '@reprman/shared/subscription'
import { withPracticeApplied } from '@reprman/shared/repr-rules'
import { serverConfig } from './config'
import { keyForUserConfig } from './userConfig'

const TABLE_NAME = serverConfig.reprsTableName
const STRIPE_CUSTOMER_INDEX = serverConfig.stripeCustomerIndexName

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}))

const keyFor = (userId: string, reprId: string) => ({
  pk: `USER#${userId}`,
  sk: `REPR#${reprId}`,
})

const toDbItem = (userId: string, repr: Repr) => ({
  ...keyFor(userId, repr.id),
  repr,
})

export const listReprs = async (userId: string): Promise<Repr[]> => {
  const result = await client.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'pk = :pk AND begins_with(sk, :reprPrefix)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':reprPrefix': 'REPR#',
      },
    })
  )

  const reprs = (result.Items ?? [])
    .map((item) => item.repr as Repr)
    .filter(Boolean)

  return reprs
}

/**
 * Loads user config, creating a minimal CONFIG row (pk + sk only) when missing
 * so existing users and new signups have a durable row in DynamoDB.
 */
export const getUserConfig = async (
  userId: string
): Promise<UserConfigItem> => {
  const key = keyForUserConfig(userId)
  const result = await client.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: key,
    })
  )
  if (result.Item) {
    return result.Item as UserConfigItem
  }

  const newItem: UserConfigItem = {
    ...key,
    trialEndsAtMs: computeTrialEndsAtMs(),
  }
  try {
    await client.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: newItem,
        ConditionExpression: 'attribute_not_exists(pk)',
      })
    )
    return newItem
  } catch (error: unknown) {
    if (error instanceof ConditionalCheckFailedException) {
      const again = await client.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: key,
        })
      )
      if (again.Item) {
        return again.Item as UserConfigItem
      }
    }
    throw error
  }
}

export const recordTermsAcceptance = async (
  userId: string,
  termsVersion: string
): Promise<UserConfigItem> => {
  await getUserConfig(userId)
  const key = keyForUserConfig(userId)
  const acceptedAt = new Date().toISOString()
  await client.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: key,
      UpdateExpression:
        'SET termsAcceptedAt = :acceptedAt, termsVersion = :termsVersion',
      ExpressionAttributeValues: {
        ':acceptedAt': acceptedAt,
        ':termsVersion': termsVersion,
      },
    })
  )
  const result = await client.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: key,
    })
  )
  return result.Item as UserConfigItem
}

export const updateUserPracticeSettings = async (
  userId: string,
  settings: PracticeSettings
): Promise<UserConfigItem> => {
  await getUserConfig(userId)
  const key = keyForUserConfig(userId)
  await client.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: key,
      UpdateExpression:
        'SET practiceDelay = :practiceDelay, warningRatio = :warningRatio',
      ExpressionAttributeValues: {
        ':practiceDelay': settings.practiceDelay,
        ':warningRatio': settings.warningRatio,
      },
    })
  )
  const result = await client.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: key,
    })
  )
  return result.Item as UserConfigItem
}

export const countReprsForUser = async (userId: string): Promise<number> => {
  const result = await client.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'pk = :pk AND begins_with(sk, :reprPrefix)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':reprPrefix': 'REPR#',
      },
      Select: 'COUNT',
    })
  )
  return result.Count ?? 0
}

export const reprExists = async (
  userId: string,
  reprId: string
): Promise<boolean> => {
  const result = await client.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: keyFor(userId, reprId),
      ProjectionExpression: 'pk',
    })
  )
  return Boolean(result.Item)
}

export type UpsertResult = 'created' | 'updated'

export const upsertRepr = async (
  userId: string,
  repr: Repr
): Promise<UpsertResult> => {
  const key = keyFor(userId, repr.id)
  const existing = await client.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: key,
      ProjectionExpression: 'pk',
    })
  )

  await client.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: toDbItem(userId, repr),
    })
  )

  return existing.Item ? 'updated' : 'created'
}

export const markPracticed = async (
  userId: string,
  reprId: string
): Promise<Repr | null> => {
  const result = await client.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: keyFor(userId, reprId),
    })
  )
  const repr = result.Item?.repr as Repr | undefined
  if (!repr) {
    return null
  }

  const next = withPracticeApplied(repr)

  await upsertRepr(userId, next)
  return next
}

export const deleteRepr = async (
  userId: string,
  reprId: string
): Promise<void> => {
  await client.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: keyFor(userId, reprId),
    })
  )
}

export type BillingConfigUpdate = {
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  stripeSubscriptionStatus?: string
  stripeCurrentPeriodEndMs?: number | null
  subscriptionTier?: 'unlimited' | null
  complimentaryPaidUntilMs?: number | null
}

export const updateUserBillingConfig = async (
  userId: string,
  update: BillingConfigUpdate
): Promise<UserConfigItem> => {
  await getUserConfig(userId)
  const key = keyForUserConfig(userId)
  const sets: string[] = []
  const removes: string[] = []
  const values: Record<string, unknown> = {}

  const assign = (attr: string, value: unknown) => {
    if (value === null) {
      removes.push(attr)
      return
    }
    if (value !== undefined) {
      sets.push(`${attr} = :${attr}`)
      values[`:${attr}`] = value
    }
  }

  assign('stripeCustomerId', update.stripeCustomerId)
  assign('stripeSubscriptionId', update.stripeSubscriptionId)
  assign('stripeSubscriptionStatus', update.stripeSubscriptionStatus)
  assign('stripeCurrentPeriodEndMs', update.stripeCurrentPeriodEndMs)
  assign('subscriptionTier', update.subscriptionTier)
  assign('complimentaryPaidUntilMs', update.complimentaryPaidUntilMs)

  if (sets.length === 0 && removes.length === 0) {
    return getUserConfig(userId)
  }

  let updateExpression = ''
  if (sets.length > 0) {
    updateExpression += `SET ${sets.join(', ')}`
  }
  if (removes.length > 0) {
    updateExpression += `${sets.length > 0 ? ' ' : ''}REMOVE ${removes.join(
      ', '
    )}`
  }

  await client.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: key,
      UpdateExpression: updateExpression,
      ExpressionAttributeValues:
        Object.keys(values).length > 0 ? values : undefined,
    })
  )

  return getUserConfig(userId)
}

export const findUserIdByStripeCustomerId = async (
  stripeCustomerId: string
): Promise<string | null> => {
  const result = await client.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: STRIPE_CUSTOMER_INDEX,
      KeyConditionExpression:
        'stripeCustomerId = :customerId AND sk = :configSk',
      ExpressionAttributeValues: {
        ':customerId': stripeCustomerId,
        ':configSk': 'CONFIG',
      },
      ProjectionExpression: 'pk',
      Limit: 1,
    })
  )
  const item = result.Items?.[0]
  if (!item?.pk || typeof item.pk !== 'string') {
    return null
  }
  return item.pk.replace(/^USER#/, '')
}
