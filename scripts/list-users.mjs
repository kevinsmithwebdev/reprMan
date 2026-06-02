#!/usr/bin/env node
/**
 * List Cognito users with account creation time, last API activity day, subscription
 * status, and repr count.
 *
 * Usage:
 *   node scripts/list-users.mjs
 *   node scripts/list-users.mjs --env dev
 *   yarn users:list
 *   yarn users:list --env dev
 *
 * Defaults to prod (`ReprServerStack-Prod`). Resolves UserPoolId and DynamoDB table
 * names from CloudFormation. Requires AWS credentials with:
 *   cloudformation:DescribeStacks, cloudformation:DescribeStackResources
 *   cognito-idp:ListUsers
 *   dynamodb:Scan on ReprsTable and DailyUsageTable
 */

import {
  CloudFormationClient,
  DescribeStackResourcesCommand,
  DescribeStacksCommand,
} from '@aws-sdk/client-cloudformation'
import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
} from '@aws-sdk/client-cognito-identity-provider'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb'

const USER_PK_PREFIX = 'USER#'
const REPR_SK_PREFIX = 'REPR#'
const CONFIG_SK = 'CONFIG'
const DAY_PK_PREFIX = 'DAY#'

const STRIPE_PAID_STATUSES = new Set(['active', 'trialing'])

/** Keep in sync with libs/shared/subscription/src/index.ts */
function resolveSubscriptionStatus(config, nowMs = Date.now()) {
  if (config?.subscriptionTier === 'unlimited') {
    return 'unlimited'
  }

  const stripePaid = Boolean(
    config?.stripeSubscriptionStatus &&
      STRIPE_PAID_STATUSES.has(config.stripeSubscriptionStatus)
  )
  const complimentaryPaid =
    typeof config?.complimentaryPaidUntilMs === 'number' &&
    nowMs < config.complimentaryPaidUntilMs

  if (stripePaid || complimentaryPaid) {
    return 'paid'
  }

  if (
    typeof config?.trialEndsAtMs === 'number' &&
    nowMs < config.trialEndsAtMs
  ) {
    return 'trial'
  }

  return 'unpaid'
}

const STACK_BY_ENV = {
  dev: 'ReprServerStack-Dev',
  prod: 'ReprServerStack-Prod',
}

function printUsage() {
  console.error(`Usage: node scripts/list-users.mjs [--env dev|prod]

  --env    Target environment (default: prod)
  --help   Show this message`)
}

function parseEnv(argv) {
  if (argv.includes('--help') || argv.includes('-h')) {
    printUsage()
    process.exit(0)
  }

  const flagIndex = argv.indexOf('--env')
  if (flagIndex !== -1) {
    const value = argv[flagIndex + 1]?.toLowerCase()
    if (!value || value.startsWith('-')) {
      console.error('--env requires a value: dev or prod')
      process.exit(1)
    }
    if (value !== 'dev' && value !== 'prod') {
      console.error('--env must be dev or prod')
      process.exit(1)
    }
    return value
  }

  const inline = argv.find((arg) => arg.startsWith('--env='))
  if (inline) {
    const value = inline.slice('--env='.length).toLowerCase()
    if (value !== 'dev' && value !== 'prod') {
      console.error('--env must be dev or prod')
      process.exit(1)
    }
    return value
  }

  return 'prod'
}

function attr(user, name) {
  return user.Attributes?.find((a) => a.Name === name)?.Value
}

function formatDateTime(date) {
  if (!date) {
    return '—'
  }
  const d = date instanceof Date ? date : new Date(date)
  if (Number.isNaN(d.getTime())) {
    return '—'
  }
  return d
    .toISOString()
    .replace('T', ' ')
    .replace(/\.\d{3}Z$/, ' UTC')
}

function dayKeyToMs(dayKey) {
  if (!dayKey) {
    return undefined
  }
  const ms = Date.parse(`${dayKey}T00:00:00.000Z`)
  return Number.isNaN(ms) ? undefined : ms
}

const TABLE_COLUMNS = [
  'email',
  'created',
  'last_active',
  'subscription',
  'reprs',
]

/** Like console.table but index column has no header label. */
function printUserTable(rows) {
  const headers = ['', ...TABLE_COLUMNS]
  const body = rows.map((row, index) => [
    String(index),
    ...TABLE_COLUMNS.map((col) => String(row[col] ?? '')),
  ])
  const widths = headers.map((header, col) =>
    Math.max(header.length, ...body.map((cells) => cells[col].length))
  )
  const pad = (text, col) => text.padEnd(widths[col])
  const rowLine = (cells) =>
    `│ ${cells.map((cell, col) => pad(cell, col)).join(' │ ')} │`
  const borderSegment = (left, mid, right) =>
    left + widths.map((w) => '─'.repeat(w + 2)).join(mid) + right

  console.log(borderSegment('┌', '┬', '┐'))
  console.log(rowLine(headers))
  console.log(borderSegment('├', '┼', '┤'))
  for (const cells of body) {
    console.log(rowLine(cells))
  }
  console.log(borderSegment('└', '┴', '┘'))
}

const cf = new CloudFormationClient({})
const cognito = new CognitoIdentityProviderClient({})
const doc = DynamoDBDocumentClient.from(new DynamoDBClient({}))

async function listStackResources(stackName) {
  const resources = []
  let nextToken

  do {
    const page = await cf.send(
      new DescribeStackResourcesCommand({
        StackName: stackName,
        NextToken: nextToken,
      })
    )
    resources.push(...(page.StackResources ?? []))
    nextToken = page.NextToken
  } while (nextToken)

  return resources
}

/** CDK logical ids are `ReprsTable` + hash, not the bare construct id. */
function findDynamoTablePhysicalId(resources, constructId) {
  const match = resources.find(
    (r) =>
      r.ResourceType === 'AWS::DynamoDB::Table' &&
      (r.LogicalResourceId === constructId ||
        r.LogicalResourceId?.startsWith(`${constructId}`))
  )
  return match?.PhysicalResourceId
}

async function resolveStack(stackName) {
  const stackResult = await cf.send(
    new DescribeStacksCommand({ StackName: stackName })
  )
  const stack = stackResult.Stacks?.[0]
  if (!stack) {
    throw new Error(`Stack not found: ${stackName}`)
  }

  const userPoolId = stack.Outputs?.find(
    (o) => o.OutputKey === 'UserPoolId'
  )?.OutputValue
  if (!userPoolId) {
    throw new Error(`Stack ${stackName} has no UserPoolId output`)
  }

  const resources = await listStackResources(stackName)

  const reprsTableName = findDynamoTablePhysicalId(resources, 'ReprsTable')
  const dailyUsageTableName = findDynamoTablePhysicalId(
    resources,
    'DailyUsageTable'
  )

  if (!reprsTableName) {
    const tables = resources
      .filter((r) => r.ResourceType === 'AWS::DynamoDB::Table')
      .map((r) => r.LogicalResourceId)
      .join(', ')
    throw new Error(
      `Stack ${stackName} has no ReprsTable* DynamoDB resource (tables: ${
        tables || 'none'
      })`
    )
  }
  if (!dailyUsageTableName) {
    const tables = resources
      .filter((r) => r.ResourceType === 'AWS::DynamoDB::Table')
      .map((r) => r.LogicalResourceId)
      .join(', ')
    throw new Error(
      `Stack ${stackName} has no DailyUsageTable* DynamoDB resource (tables: ${
        tables || 'none'
      })`
    )
  }

  return { userPoolId, reprsTableName, dailyUsageTableName }
}

async function listCognitoUsers(userPoolId) {
  const users = []
  let paginationToken

  do {
    const page = await cognito.send(
      new ListUsersCommand({
        UserPoolId: userPoolId,
        PaginationToken: paginationToken,
      })
    )
    users.push(...(page.Users ?? []))
    paginationToken = page.PaginationToken
  } while (paginationToken)

  return users
}

async function scanReprsTableData(tableName) {
  const reprCounts = new Map()
  const userConfigs = new Map()
  let exclusiveStartKey

  do {
    const page = await doc.send(
      new ScanCommand({
        TableName: tableName,
        ProjectionExpression:
          'pk, sk, trialEndsAtMs, subscriptionTier, stripeSubscriptionStatus, stripeCurrentPeriodEndMs, complimentaryPaidUntilMs',
        ExclusiveStartKey: exclusiveStartKey,
      })
    )

    for (const item of page.Items ?? []) {
      const { pk, sk } = item
      if (typeof pk !== 'string' || !pk.startsWith(USER_PK_PREFIX)) {
        continue
      }
      if (typeof sk !== 'string') {
        continue
      }

      const userId = pk.slice(USER_PK_PREFIX.length)

      if (sk === CONFIG_SK) {
        userConfigs.set(userId, {
          trialEndsAtMs: item.trialEndsAtMs,
          subscriptionTier: item.subscriptionTier,
          stripeSubscriptionStatus: item.stripeSubscriptionStatus,
          stripeCurrentPeriodEndMs: item.stripeCurrentPeriodEndMs,
          complimentaryPaidUntilMs: item.complimentaryPaidUntilMs,
        })
        continue
      }

      if (sk.startsWith(REPR_SK_PREFIX)) {
        reprCounts.set(userId, (reprCounts.get(userId) ?? 0) + 1)
      }
    }

    exclusiveStartKey = page.LastEvaluatedKey
  } while (exclusiveStartKey)

  return { reprCounts, userConfigs }
}

async function scanLastActivity(tableName) {
  const lastDay = new Map()
  const lastAtMs = new Map()
  let exclusiveStartKey

  do {
    const page = await doc.send(
      new ScanCommand({
        TableName: tableName,
        ProjectionExpression: 'pk, sk, activeAtMs',
        ExclusiveStartKey: exclusiveStartKey,
      })
    )

    for (const item of page.Items ?? []) {
      const { pk, sk, activeAtMs } = item
      if (typeof pk !== 'string' || typeof sk !== 'string') {
        continue
      }

      if (sk === 'LAST_ACTIVE' && pk.startsWith(USER_PK_PREFIX)) {
        if (typeof activeAtMs === 'number') {
          const userId = pk.slice(USER_PK_PREFIX.length)
          lastAtMs.set(userId, activeAtMs)
        }
        continue
      }

      if (pk.startsWith(DAY_PK_PREFIX) && sk.startsWith(USER_PK_PREFIX)) {
        const day = pk.slice(DAY_PK_PREFIX.length)
        const userId = sk.slice(USER_PK_PREFIX.length)
        const prev = lastDay.get(userId)
        if (!prev || day > prev) {
          lastDay.set(userId, day)
        }
      }
    }

    exclusiveStartKey = page.LastEvaluatedKey
  } while (exclusiveStartKey)

  return { lastDay, lastAtMs }
}

function formatLastActive(userId, lastDay, lastAtMs) {
  if (!userId) {
    return '—'
  }
  const atMs = lastAtMs.get(userId) ?? dayKeyToMs(lastDay.get(userId))
  return formatDateTime(atMs)
}

async function main() {
  const env = parseEnv(process.argv.slice(2))
  const stackName = STACK_BY_ENV[env]

  console.error(`Resolving ${stackName}…`)
  const { userPoolId, reprsTableName, dailyUsageTableName } =
    await resolveStack(stackName)

  console.error('Listing Cognito users…')
  const cognitoUsers = await listCognitoUsers(userPoolId)

  console.error(`Scanning reprs table (${reprsTableName})…`)
  const { reprCounts, userConfigs } = await scanReprsTableData(reprsTableName)

  console.error(`Scanning last activity (${dailyUsageTableName})…`)
  const { lastDay, lastAtMs } = await scanLastActivity(dailyUsageTableName)

  const rows = cognitoUsers
    .map((user) => {
      const userId = attr(user, 'sub')
      const email = attr(user, 'email') ?? user.Username ?? '—'
      return {
        email,
        created: formatDateTime(user.UserCreateDate),
        last_active: formatLastActive(userId, lastDay, lastAtMs),
        subscription: userId
          ? resolveSubscriptionStatus(userConfigs.get(userId))
          : '—',
        reprs: userId ? reprCounts.get(userId) ?? 0 : 0,
        _sort: email.toLowerCase(),
      }
    })
    .sort((a, b) => a._sort.localeCompare(b._sort))
    .map(({ _sort, ...row }) => row)

  console.error(
    `\n${env} | pool ${userPoolId} | ${rows.length} user(s)\n` +
      'last_active = last API request time when available, else UTC midnight on last active day (~120d retention)\n' +
      'subscription = resolved tier from USER#…/CONFIG (trial | unpaid | paid | unlimited)\n'
  )

  printUserTable(rows)
}

try {
  await main()
} catch (err) {
  console.error(err)
  process.exit(1)
}
