import {
  BatchWriteCommand,
  DeleteCommand,
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { Repr } from '../types/repr'

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

export const upsertRepr = async (userId: string, repr: Repr): Promise<void> => {
  await client.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: toDbItem(userId, repr),
    })
  )
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
    datesPracticed: [Date.now(), ...repr.datesPracticed].slice(0, MAX_PRACTICED_DATES),
  }

  await upsertRepr(userId, next)
  return next
}

export const deleteRepr = async (userId: string, reprId: string): Promise<void> => {
  await client.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: keyFor(userId, reprId),
    })
  )
}

export const replaceAllReprs = async (userId: string, reprs: Repr[]): Promise<void> => {
  const chunks: Repr[][] = []
  for (let i = 0; i < reprs.length; i += 25) {
    chunks.push(reprs.slice(i, i + 25))
  }

  if (chunks.length === 0) {
    return
  }

  await Promise.all(
    chunks.map((chunk) =>
      client.send(
        new BatchWriteCommand({
          RequestItems: {
            [TABLE_NAME]: chunk.map((repr) => ({
              PutRequest: {
                Item: toDbItem(userId, repr),
              },
            })),
          },
        })
      )
    )
  )
}
