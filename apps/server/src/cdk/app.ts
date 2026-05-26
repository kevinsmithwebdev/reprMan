import * as cdk from 'aws-cdk-lib'
import { ReprServerStack } from './repr-server-stack'

const app = new cdk.App()

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
}

function parseCorsOriginsString(
  raw: string | undefined,
  fallbacks: string[]
): string[] {
  if (!raw?.trim()) {
    return [...fallbacks]
  }
  const list = String(raw)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  return list.length > 0 ? list : [...fallbacks]
}

function firstNonEmpty(
  ...candidates: (string | undefined)[]
): string | undefined {
  const found = candidates.find((c) => Boolean(c?.trim()))
  return found?.trim()
}

const devCors = parseCorsOriginsString(
  firstNonEmpty(
    process.env.CDK_DEV_CORS_ORIGINS,
    app.node.tryGetContext('devCorsOrigins') as string | undefined
  ),
  ['http://localhost:3000']
)

const prodCors = parseCorsOriginsString(
  firstNonEmpty(
    process.env.CDK_PROD_CORS_ORIGINS,
    app.node.tryGetContext('prodCorsOrigins') as string | undefined
  ),
  ['http://localhost:3000', 'https://www.reprman.com', 'https://reprman.com']
)

export const reprServerDevStack = new ReprServerStack(
  app,
  'ReprServerStack-Dev',
  {
    env,
    stage: 'dev',
    corsAllowOrigins: devCors,
  }
)

export const reprServerProdStack = new ReprServerStack(
  app,
  'ReprServerStack-Prod',
  {
    env,
    stage: 'prod',
    corsAllowOrigins: prodCors,
  }
)
