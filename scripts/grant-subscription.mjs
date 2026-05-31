#!/usr/bin/env node
/**
 * Grant subscription tier to a user by email (Cognito lookup → Dynamo CONFIG).
 *
 * Usage:
 *   node scripts/grant-subscription.mjs --email user@example.com --tier unlimited --env dev
 *   node scripts/grant-subscription.mjs --email user@example.com --tier paid --days 365 --env dev
 *
 * Tiers:
 *   unlimited — no repr cap, no expiration
 *   paid      — paid tier (1000 repr cap); --days sets complimentaryPaidUntilMs (default 365)
 */

import {
  CloudFormationClient,
  DescribeStackResourcesCommand,
  DescribeStacksCommand,
} from '@aws-sdk/client-cloudformation'
import {
  AdminGetUserCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb'

const STACK_BY_ENV = {
  dev: 'ReprServerStack-Dev',
  prod: 'ReprServerStack-Prod',
}

function parseArgs(argv) {
  const emailIndex = argv.indexOf('--email')
  const tierIndex = argv.indexOf('--tier')
  const daysIndex = argv.indexOf('--days')
  const envIndex = argv.indexOf('--env')

  const email = emailIndex >= 0 ? argv[emailIndex + 1] : undefined
  const tier = tierIndex >= 0 ? argv[tierIndex + 1] : undefined
  const daysRaw = daysIndex >= 0 ? argv[daysIndex + 1] : '365'
  const env = envIndex >= 0 ? argv[envIndex + 1]?.toLowerCase() : 'dev'

  if (!email || !tier) {
    console.error(
      'Usage: node scripts/grant-subscription.mjs --email EMAIL --tier unlimited|paid [--days N] [--env dev|prod]'
    )
    process.exit(1)
  }

  if (tier !== 'unlimited' && tier !== 'paid') {
    console.error('--tier must be unlimited or paid')
    process.exit(1)
  }

  if (env !== 'dev' && env !== 'prod') {
    console.error('--env must be dev or prod')
    process.exit(1)
  }

  const days = Number(daysRaw)
  if (!Number.isFinite(days) || days <= 0) {
    console.error('--days must be a positive number')
    process.exit(1)
  }

  return { email, tier, days, env }
}

async function resolveStackOutputs(stackName) {
  const cfn = new CloudFormationClient({})
  const stacks = await cfn.send(
    new DescribeStacksCommand({ StackName: stackName })
  )
  const outputs = stacks.Stacks?.[0]?.Outputs ?? []
  const byKey = Object.fromEntries(
    outputs.map((o) => [o.OutputKey, o.OutputValue])
  )

  const resources = await cfn.send(
    new DescribeStackResourcesCommand({ StackName: stackName })
  )
  const table = resources.StackResources?.find(
    (r) => r.LogicalResourceId === 'ReprsTable'
  )?.PhysicalResourceId

  return {
    userPoolId: byKey.UserPoolId,
    tableName: table,
  }
}

async function main() {
  const { email, tier, days, env } = parseArgs(process.argv.slice(2))
  const stackName = STACK_BY_ENV[env]
  const { userPoolId, tableName } = await resolveStackOutputs(stackName)

  if (!userPoolId || !tableName) {
    throw new Error(`Could not resolve Cognito pool or table from ${stackName}`)
  }

  const cognito = new CognitoIdentityProviderClient({})
  const user = await cognito.send(
    new AdminGetUserCommand({
      UserPoolId: userPoolId,
      Username: email,
    })
  )
  const sub = user.UserAttributes?.find((a) => a.Name === 'sub')?.Value
  if (!sub) {
    throw new Error(`No sub attribute for ${email}`)
  }

  const doc = DynamoDBDocumentClient.from(new DynamoDBClient({}))
  const key = { pk: `USER#${sub}`, sk: 'CONFIG' }

  if (tier === 'unlimited') {
    await doc.send(
      new UpdateCommand({
        TableName: tableName,
        Key: key,
        UpdateExpression: 'SET subscriptionTier = :tier',
        ExpressionAttributeValues: { ':tier': 'unlimited' },
      })
    )
    console.log(`Granted unlimited to ${email} (${sub}) on ${env}`)
    return
  }

  const untilMs = Date.now() + days * 86_400_000
  await doc.send(
    new UpdateCommand({
      TableName: tableName,
      Key: key,
      UpdateExpression:
        'SET complimentaryPaidUntilMs = :until REMOVE subscriptionTier',
      ExpressionAttributeValues: { ':until': untilMs },
    })
  )
  console.log(
    `Granted paid until ${new Date(
      untilMs
    ).toISOString()} to ${email} (${sub}) on ${env}`
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
