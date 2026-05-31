#!/usr/bin/env node
/**
 * List Cognito users with account creation time, last API activity day, and repr count.
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
const DAY_PK_PREFIX = 'DAY#'

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

function formatDay(dayKey) {
  if (!dayKey) {
    return '—'
  }
  return dayKey
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

async function scanReprCounts(tableName) {
  const counts = new Map()
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
      const { pk, sk } = item
      if (
        typeof pk !== 'string' ||
        !pk.startsWith(USER_PK_PREFIX) ||
        typeof sk !== 'string' ||
        !sk.startsWith(REPR_SK_PREFIX)
      ) {
        continue
      }
      const userId = pk.slice(USER_PK_PREFIX.length)
      counts.set(userId, (counts.get(userId) ?? 0) + 1)
    }

    exclusiveStartKey = page.LastEvaluatedKey
  } while (exclusiveStartKey)

  return counts
}

async function scanLastActiveDays(tableName) {
  const lastDay = new Map()
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
      const { pk, sk } = item
      if (
        typeof pk !== 'string' ||
        !pk.startsWith(DAY_PK_PREFIX) ||
        typeof sk !== 'string' ||
        !sk.startsWith(USER_PK_PREFIX)
      ) {
        continue
      }
      const day = pk.slice(DAY_PK_PREFIX.length)
      const userId = sk.slice(USER_PK_PREFIX.length)
      const prev = lastDay.get(userId)
      if (!prev || day > prev) {
        lastDay.set(userId, day)
      }
    }

    exclusiveStartKey = page.LastEvaluatedKey
  } while (exclusiveStartKey)

  return lastDay
}

async function main() {
  const env = parseEnv(process.argv.slice(2))
  const stackName = STACK_BY_ENV[env]

  console.error(`Resolving ${stackName}…`)
  const { userPoolId, reprsTableName, dailyUsageTableName } =
    await resolveStack(stackName)

  console.error('Listing Cognito users…')
  const cognitoUsers = await listCognitoUsers(userPoolId)

  console.error(`Scanning repr counts (${reprsTableName})…`)
  const reprCounts = await scanReprCounts(reprsTableName)

  console.error(`Scanning last activity (${dailyUsageTableName})…`)
  const lastActiveDays = await scanLastActiveDays(dailyUsageTableName)

  const rows = cognitoUsers
    .map((user) => {
      const userId = attr(user, 'sub')
      const email = attr(user, 'email') ?? user.Username ?? '—'
      return {
        email,
        created: formatDateTime(user.UserCreateDate),
        last_active: userId ? formatDay(lastActiveDays.get(userId)) : '—',
        reprs: userId ? reprCounts.get(userId) ?? 0 : 0,
        _sort: email.toLowerCase(),
      }
    })
    .sort((a, b) => a._sort.localeCompare(b._sort))
    .map(({ _sort, ...row }) => row)

  console.error(
    `\n${env} | pool ${userPoolId} | ${rows.length} user(s)\n` +
      'last_active = last calendar day with API usage (DailyUsageTable; ~120d retention)\n'
  )

  console.table(rows)
}

try {
  await main()
} catch (err) {
  console.error(err)
  process.exit(1)
}
