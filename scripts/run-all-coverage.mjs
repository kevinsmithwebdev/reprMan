#!/usr/bin/env node
/**
 * Runs Vitest (client-web) and Jest (server + shared libs) with coverage,
 * normalizes LCOV paths, and merges into apps/client-web/coverage/lcov.info.
 */
import { spawnSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const clientWeb = resolve(root, 'apps/client-web')

const run = (label, command, args, cwd) => {
  console.log(`\n[run-all-coverage] ${label}`)
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    env: process.env,
  })
  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

mkdirSync(resolve(clientWeb, 'coverage'), { recursive: true })

run(
  'Vitest (client-web)',
  process.execPath,
  [
    resolve(clientWeb, 'scripts/run-vitest-coverage.mjs'),
    ...process.argv.slice(2),
  ],
  clientWeb
)

const jestProjects = [
  { label: 'server', cwd: 'apps/server', args: ['--coverage'] },
  {
    label: 'shared-quota',
    cwd: 'libs/shared/quota',
    args: ['--coverage', '--collectCoverageFrom=src/index.ts'],
  },
  {
    label: 'shared-subscription',
    cwd: 'libs/shared/subscription',
    args: ['--coverage', '--collectCoverageFrom=src/index.ts'],
  },
  {
    label: 'shared-repr-validation',
    cwd: 'libs/shared/repr-validation',
    args: ['--coverage', '--collectCoverageFrom=src/index.ts'],
  },
  {
    label: 'constants',
    cwd: 'libs/constants',
    args: ['--coverage', '--collectCoverageFrom=src/index.ts'],
  },
  {
    label: 'shared-repr-rules',
    cwd: 'libs/shared/repr-rules',
    args: ['--coverage', '--collectCoverageFrom=src/index.ts'],
  },
]

const lcovInputs = ['apps/client-web/coverage/lcov.info']

for (const project of jestProjects) {
  run(
    `Jest (${project.label})`,
    'npx',
    ['jest', '--config', 'jest.config.js', ...project.args],
    resolve(root, project.cwd)
  )
  lcovInputs.push(`${project.cwd}/coverage/lcov.info`)
}

run(
  'Normalize LCOV paths',
  process.execPath,
  [resolve(root, 'scripts/normalize-lcov-paths.mjs'), ...lcovInputs],
  root
)

run(
  'Merge LCOV reports',
  process.execPath,
  [resolve(root, 'scripts/merge-lcov.mjs'), ...lcovInputs],
  root
)
