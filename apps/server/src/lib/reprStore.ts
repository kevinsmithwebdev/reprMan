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
} from '@aws-sdk/lib-dynamodb'
import { Repr } from '../types/repr'
import { keyForUserConfig, type UserConfigItem } from './userConfig'

const TABLE_NAME = process.env.REPRS_TABLE_NAME ?? ''
const MAX_PRACTICED_DATES = 100

if (!TABLE_NAME) {
  throw new Error('REPRS_TABLE_NAME is required')
}

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

  const newItem: UserConfigItem = { ...key }
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
  const reprs = await listReprs(userId)
  const repr = reprs.find((item) => item.id === reprId)
  if (!repr) {
    return null
  }

  const next: Repr = {
    ...repr,
    datesPracticed: [Date.now(), ...repr.datesPracticed].slice(
      0,
      MAX_PRACTICED_DATES
    ),
  }

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
