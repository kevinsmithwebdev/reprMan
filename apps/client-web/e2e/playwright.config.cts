import { defineConfig, devices } from '@playwright/test'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const e2eDir = __dirname
const specsDir = path.join(e2eDir, 'specs')
const repoRoot = path.resolve(e2eDir, '../../..')

const loadEnvFile = (filePath: string, override = false) => {
  try {
    const text = readFileSync(filePath, 'utf8')
    for (const line of text.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      let value = trimmed.slice(eq + 1).trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      if (override || process.env[key] === undefined) {
        process.env[key] = value
      }
    }
  } catch {
    // optional file
  }
}

loadEnvFile(path.join(repoRoot, '.env.e2e'))
loadEnvFile(path.join(repoRoot, '.env'))
loadEnvFile(path.join(repoRoot, '.env.local'), true)
const authFile = path.join(e2eDir, '.auth', 'user.json')

export default defineConfig({
  testDir: specsDir,
  testMatch: '**/*.spec.ts',
  timeout: 90_000,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // One Vite dev server cannot reliably serve many browsers at once.
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    permissions: ['clipboard-read', 'clipboard-write'],
  },
  projects: [
    {
      name: 'setup',
      testDir: e2eDir,
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: authFile,
      },
      dependencies: ['setup'],
      testIgnore: [
        /auth\.setup\.ts/,
        /signup\.spec\.ts/,
        /auth-guest\.spec\.ts/,
      ],
    },
    {
      name: 'chromium-guest',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
      testMatch: [/signup\.spec\.ts/, /auth-guest\.spec\.ts/],
    },
  ],
  webServer: process.env.E2E_SKIP_WEB_SERVER
    ? undefined
    : {
        command: 'yarn start',
        url: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
        // Reuse an already running local dev server; CI still starts a fresh one.
        reuseExistingServer:
          process.env.E2E_REUSE_EXISTING_SERVER === '1' || !process.env.CI,
        cwd: repoRoot,
        timeout: 180_000,
        env: {
          ...process.env,
        },
      },
})
