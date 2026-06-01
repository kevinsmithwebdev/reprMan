#!/usr/bin/env node
/**
 * Interactively set a user's subscription status (DynamoDB USER#… / CONFIG).
 *
 * Usage:
 *   node scripts/set-user-status.mjs
 *   yarn users:set-status
 *
 * Prompts for environment (dev|prod), username (Cognito email), and status
 * (trial|unpaid|paid|unlimited). Requires AWS credentials with:
 *   cloudformation:DescribeStacks, cloudformation:DescribeStackResources
 *   cognito-idp:AdminGetUser
 *   dynamodb:UpdateItem on ReprsTable
 */

import * as readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
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

const VALID_ENVS = ['dev', 'prod']
const VALID_STATUSES = ['trial', 'unpaid', 'paid', 'unlimited']

const MS_PER_DAY = 86_400_000
const DEFAULT_TRIAL_DAYS = 90
const DEFAULT_PAID_DAYS = 365

const BILLING_ATTRS = [
  'subscriptionTier',
  'complimentaryPaidUntilMs',
  'stripeSubscriptionStatus',
  'stripeCurrentPeriodEndMs',
]

function buildUpdate(status) {
  const now = Date.now()

  switch (status) {
    case 'unlimited':
      return {
        UpdateExpression: `SET subscriptionTier = :tier REMOVE ${BILLING_ATTRS.filter(
          (a) => a !== 'subscriptionTier'
        ).join(', ')}`,
        ExpressionAttributeValues: { ':tier': 'unlimited' },
      }
    case 'paid': {
      const untilMs = now + DEFAULT_PAID_DAYS * MS_PER_DAY
      return {
        UpdateExpression: `SET complimentaryPaidUntilMs = :until REMOVE subscriptionTier, stripeSubscriptionStatus, stripeCurrentPeriodEndMs`,
        ExpressionAttributeValues: { ':until': untilMs },
        untilMs,
      }
    }
    case 'trial': {
      const trialEndsAtMs = now + DEFAULT_TRIAL_DAYS * MS_PER_DAY
      return {
        UpdateExpression: `SET trialEndsAtMs = :trialEnd REMOVE subscriptionTier, complimentaryPaidUntilMs, stripeSubscriptionStatus, stripeCurrentPeriodEndMs`,
        ExpressionAttributeValues: { ':trialEnd': trialEndsAtMs },
        trialEndsAtMs,
      }
    }
    case 'unpaid':
      return {
        UpdateExpression: `SET trialEndsAtMs = :past REMOVE subscriptionTier, complimentaryPaidUntilMs, stripeSubscriptionStatus, stripeCurrentPeriodEndMs`,
        ExpressionAttributeValues: { ':past': now - 1 },
      }
    default:
      throw new Error(`Unknown status: ${status}`)
  }
}

async function promptChoice(rl, label, choices) {
  const list = choices.join('|')
  for (;;) {
    const raw = (await rl.question(`${label} (${list}): `)).trim().toLowerCase()
    if (choices.includes(raw)) {
      return raw
    }
    console.log(`  Enter one of: ${list}`)
  }
}

async function promptConfirm(rl, message) {
  const raw = (await rl.question(`${message} [y/N]: `)).trim().toLowerCase()
  return raw === 'y' || raw === 'yes'
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
  const rl = readline.createInterface({ input, output })

  let env
  let username
  let status

  try {
    env = await promptChoice(rl, 'Environment', VALID_ENVS)
    username = (await rl.question('Username (Cognito email): ')).trim()
    if (!username) {
      console.error('Username is required')
      process.exit(1)
    }
    status = await promptChoice(rl, 'Status', VALID_STATUSES)

    const ok = await promptConfirm(
      rl,
      `Set ${username} to "${status}" on ${env}?`
    )
    if (!ok) {
      console.log('Cancelled.')
      return
    }
  } finally {
    rl.close()
  }

  const stackName = STACK_BY_ENV[env]
  const { userPoolId, tableName } = await resolveStackOutputs(stackName)

  if (!userPoolId || !tableName) {
    throw new Error(`Could not resolve Cognito pool or table from ${stackName}`)
  }

  const cognito = new CognitoIdentityProviderClient({})
  const user = await cognito.send(
    new AdminGetUserCommand({
      UserPoolId: userPoolId,
      Username: username,
    })
  )
  const sub = user.UserAttributes?.find((a) => a.Name === 'sub')?.Value
  if (!sub) {
    throw new Error(`No sub attribute for ${username}`)
  }

  const update = buildUpdate(status)
  const doc = DynamoDBDocumentClient.from(new DynamoDBClient({}))

  await doc.send(
    new UpdateCommand({
      TableName: tableName,
      Key: { pk: `USER#${sub}`, sk: 'CONFIG' },
      ...update,
    })
  )

  const detail =
    status === 'paid' && update.untilMs
      ? ` (complimentary until ${new Date(update.untilMs).toISOString()})`
      : status === 'trial' && update.trialEndsAtMs
      ? ` (trial until ${new Date(update.trialEndsAtMs).toISOString()})`
      : ''

  console.log(`Set ${username} (${sub}) to ${status} on ${env}${detail}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
