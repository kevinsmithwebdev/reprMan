#!/usr/bin/env node
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { spawnSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const prefix = process.argv[2]
const command = process.argv[3]
const forwardedArgs = process.argv.slice(4)

if (!prefix || !command) {
  console.error(
    'Usage: node scripts/with-build-metadata.mjs <PREFIX> "<command>"'
  )
  process.exit(1)
}

const rootPackageJsonPath = join(ROOT, 'package.json')
const rootPackageJson = JSON.parse(readFileSync(rootPackageJsonPath, 'utf8'))

const gitShaResult = spawnSync('git', ['rev-parse', '--short', 'HEAD'], {
  cwd: ROOT,
  encoding: 'utf8',
})

const gitSha =
  gitShaResult.status === 0 && gitShaResult.stdout.trim()
    ? gitShaResult.stdout.trim()
    : 'unknown'

const buildMetadata = {
  [`${prefix}_VERSION`]: rootPackageJson.version ?? 'unknown',
  [`${prefix}_BUILD_NUMBER`]: process.env.BUILD_NUMBER ?? 'local',
  [`${prefix}_BUILD_TIME_UTC`]: new Date().toISOString(),
  [`${prefix}_GIT_SHA`]: process.env.GIT_SHA ?? gitSha,
}

const escapedForwardedArgs = forwardedArgs.map((arg) =>
  /[\s"]/u.test(arg) ? `"${arg.replace(/"/gu, '\\"')}"` : arg
)
const commandWithArgs =
  escapedForwardedArgs.length > 0
    ? `${command} ${escapedForwardedArgs.join(' ')}`
    : command

const runResult = spawnSync(commandWithArgs, {
  shell: true,
  stdio: 'inherit',
  env: {
    ...process.env,
    ...buildMetadata,
  },
})

process.exit(runResult.status ?? 1)
