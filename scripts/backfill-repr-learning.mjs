#!/usr/bin/env node
/**
 * Backfill `repr.learning` on DynamoDB repr items (sk begins with REPR#).
 *
 * Existing items without the field are treated as non-learning. This script
 * writes `learning: false` (or preserves `true`) so every repr blob has an
 * explicit boolean. The app does not require this backfill — client and server
 * default missing values to false on read/parse.
 *
 * Usage:
 *   REPRS_TABLE_NAME=YourTable node scripts/backfill-repr-learning.mjs
 *   REPRS_TABLE_NAME=YourTable node scripts/backfill-repr-learning.mjs --dry-run
 *
 * Requires AWS credentials with dynamodb:Scan and dynamodb:PutItem on the table.
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  BatchWriteCommand,
  DynamoDBDocumentClient,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb'

const REPR_PREFIX = 'REPR#'
const BATCH_SIZE = 25

const tableName = process.env.REPRS_TABLE_NAME?.trim()
const dryRun = process.argv.includes('--dry-run')

if (!tableName) {
  console.error(
    'REPRS_TABLE_NAME must be set (e.g. export REPRS_TABLE_NAME=ReprManStack-ReprsTable...)'
  )
  process.exit(1)
}

const doc = DynamoDBDocumentClient.from(new DynamoDBClient({}))

function normalizeLearning(repr) {
  if (!repr || typeof repr !== 'object') {
    return null
  }
  const learning = repr.learning === true
  if (typeof repr.learning === 'boolean' && repr.learning === learning) {
    return null
  }
  return { ...repr, learning }
}

async function scanReprItems() {
  const items = []
  let exclusiveStartKey

  do {
    const page = await doc.send(
      new ScanCommand({
        TableName: tableName,
        FilterExpression: 'begins_with(sk, :reprPrefix)',
        ExpressionAttributeValues: {
          ':reprPrefix': REPR_PREFIX,
        },
        ExclusiveStartKey: exclusiveStartKey,
      })
    )

    for (const item of page.Items ?? []) {
      items.push(item)
    }

    exclusiveStartKey = page.LastEvaluatedKey
  } while (exclusiveStartKey)

  return items
}

async function writeBatch(puts) {
  if (!puts.length) return

  await doc.send(
    new BatchWriteCommand({
      RequestItems: {
        [tableName]: puts.map((Item) => ({ PutRequest: { Item } })),
      },
    })
  )
}

async function main() {
  console.info(
    dryRun
      ? `[dry-run] Scanning ${tableName} (no writes)`
      : `Scanning ${tableName}…`
  )

  const items = await scanReprItems()
  const toUpdate = []

  for (const item of items) {
    const nextRepr = normalizeLearning(item.repr)
    if (!nextRepr) continue
    toUpdate.push({ ...item, repr: nextRepr })
  }

  console.info(
    `Repr items scanned: ${items.length}, need learning field: ${toUpdate.length}`
  )

  if (dryRun) {
    for (const item of toUpdate.slice(0, 5)) {
      console.info(`[dry-run] would Put ${item.pk} / ${item.sk}`)
    }
    if (toUpdate.length > 5) {
      console.info(`[dry-run] … and ${toUpdate.length - 5} more`)
    }
    return
  }

  let written = 0
  for (let i = 0; i < toUpdate.length; i += BATCH_SIZE) {
    const chunk = toUpdate.slice(i, i + BATCH_SIZE)
    await writeBatch(chunk)
    written += chunk.length
    console.info(`Wrote ${written} / ${toUpdate.length}`)
  }

  console.info(`Done. Updated ${written} repr items.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
