const { existsSync, mkdirSync, writeFileSync } = require('node:fs')
const { resolve } = require('node:path')

process.env.REPRS_TABLE_NAME =
  process.env.REPRS_TABLE_NAME || 'test-reprs-table'
process.env.DAILY_USAGE_TABLE_NAME =
  process.env.DAILY_USAGE_TABLE_NAME || 'test-daily-usage-table'

// CDK synth tests reference lambda.Code.fromAsset('dist'); stub when build has not run.
const distDir = resolve(__dirname, 'dist')
const handlersDir = resolve(distDir, 'handlers')
const routerPath = resolve(handlersDir, 'router.js')

if (!existsSync(routerPath)) {
  mkdirSync(handlersDir, { recursive: true })
  writeFileSync(
    routerPath,
    'exports.handler = async () => ({ statusCode: 200 })'
  )
}
