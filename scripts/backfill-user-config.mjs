#!/usr/bin/env node
/**
 * Backfill DynamoDB USER#… / CONFIG rows for users who have data but no config item.
 *
 * Usage:
 *   REPRS_TABLE_NAME=YourTable node scripts/backfill-user-config.mjs
 *   REPRS_TABLE_NAME=YourTable node scripts/backfill-user-config.mjs --dry-run
 *
 * Requires AWS credentials with dynamodb:Scan and dynamodb:PutItem on the table.
 */

import {
  ConditionalCheckFailedException,
  DynamoDBClient,
} from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb'

const USER_PREFIX = 'USER#'
const CONFIG_SK = 'CONFIG'

const tableName = process.env.REPRS_TABLE_NAME?.trim()
const dryRun = process.argv.includes('--dry-run')

if (!tableName) {
  console.error(
    'REPRS_TABLE_NAME must be set (e.g. export REPRS_TABLE_NAME=ReprManStack-ReprsTable...)'
  )
  process.exit(1)
}

const doc = DynamoDBDocumentClient.from(new DynamoDBClient({}))

async function scanAllKeys() {
  const users = new Map()
  let exclusiveStartKey

  do {
    const page = await doc.send(
      new ScanCommand({
        TableName: tableName,
        ProjectionExpression: 'pk, sk',
        ExclusiveStartKey: exclusiveStartKey,
      })
    )

    for (const item of page.Items ?? []) {
      const pk = item.pk
      const sk = item.sk
      if (typeof pk !== 'string' || !pk.startsWith(USER_PREFIX)) {
        continue
      }
      const userId = pk.slice(USER_PREFIX.length)
      const state = users.get(userId) ?? { hasConfig: false }
      if (sk === CONFIG_SK) {
        state.hasConfig = true
      }
      users.set(userId, state)
    }

    exclusiveStartKey = page.LastEvaluatedKey
  } while (exclusiveStartKey)

  return users
}

async function main() {
  console.info(
    dryRun
      ? `[dry-run] Scanning ${tableName} (no writes)`
      : `Scanning ${tableName}…`
  )

  const users = await scanAllKeys()
  const missing = [...users.entries()].filter(([, s]) => !s.hasConfig)

  console.info(
    `Partitions seen: ${users.size}, missing CONFIG: ${missing.length}`
  )

  let created = 0
  let skippedConditional = 0

  for (const [userId] of missing) {
    const item = {
      pk: `${USER_PREFIX}${userId}`,
      sk: CONFIG_SK,
    }

    if (dryRun) {
      console.info(`[dry-run] would Put ${item.pk} / ${item.sk}`)
      created += 1
      continue
    }

    try {
      await doc.send(
        new PutCommand({
          TableName: tableName,
          Item: item,
          ConditionExpression: 'attribute_not_exists(pk)',
        })
      )
      created += 1
      console.info(`Created ${item.pk} / ${item.sk}`)
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) {
        skippedConditional += 1
      } else {
        throw error
      }
    }
  }

  console.info(
    dryRun
      ? `[dry-run] Rows that would be created: ${created}`
      : `Done. Created ${created}, skipped (already present) ${skippedConditional}.`
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
