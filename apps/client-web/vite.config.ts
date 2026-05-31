/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from 'node:path'
import { coverageConfigDefaults } from 'vitest/config'

const root = path.resolve(__dirname, '../..')
const posixPath = (p) => p.replaceAll('\\', '/')

const lib = (name) => path.resolve(root, 'libs', name, 'src/index.ts')
const libRoot = (name) => path.resolve(root, 'libs', name, 'src')
const sharedLib = (name) =>
  path.resolve(root, 'libs/shared', name, 'src/index.ts')

export default defineConfig({
  root: __dirname,
  envDir: root,
  plugins: [react()],
  resolve: {
    alias: [
      // Cross-app shared libs.
      {
        find: /^@reprman\/shared\/repr-model$/,
        replacement: sharedLib('repr-model'),
      },
      {
        find: /^@reprman\/shared\/repr-validation$/,
        replacement: sharedLib('repr-validation'),
      },
      {
        find: /^@reprman\/shared\/repr-rules$/,
        replacement: sharedLib('repr-rules'),
      },
      { find: /^@reprman\/shared\/quota$/, replacement: sharedLib('quota') },
      {
        find: /^@reprman\/shared\/subscription$/,
        replacement: sharedLib('subscription'),
      },

      // App-local test helpers (used from `libs/.../integration-tests` via Vitest include).
      {
        find: /^@client-web\/test-utils\/(.+)$/,
        replacement: `${path.resolve(__dirname, 'src/test-utils')}/$1`,
      },
      {
        find: /^@client-web\/test-utils$/,
        replacement: path.resolve(__dirname, 'src/test-utils/index.ts'),
      },

      // Client libs — `@reprman/<lib>` (barrel) and `@reprman/<lib>/<sub>`
      // (deep import). Order matters: deeper / more specific first.
      ...[
        'components',
        'modals',
        'state',
        'cognito-auth',
        'localization',
        'reprs-api',
        'utilities',
        'constants',
        'types',
        'theme',
      ].flatMap((name) => [
        {
          find: new RegExp(`^@reprman/${name}/(.+)$`),
          replacement: `${libRoot(name)}/$1`,
        },
        { find: new RegExp(`^@reprman/${name}$`), replacement: lib(name) },
      ]),
    ],
  },
  build: {
    outDir: 'build',
    emptyOutDir: true,
    sourcemap: true,
  },
  server: {
    port: 3000,
    open: true,
    // Allow Vitest to load tests under `../../libs/**` (see `test.include`).
    fs: {
      allow: [root],
    },
  },
  preview: {
    port: 3000,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    globalSetup: ['./scripts/vitest-global-setup.mjs'],
    // `forks` gives each worker its own process (safe with per-file `vi.mock` and jsdom).
    // `threads` + parallel files share one jsdom per worker → empty `<body />` flakes.
    pool: 'forks',
    css: false,
    include: [
      'src/**/*.test.{ts,tsx}',
      'src/**/integration-tests/**/*.test.{ts,tsx}',
      '../../libs/components/src/**/*.test.{ts,tsx}',
      '../../libs/components/src/**/integration-tests/**/*.test.{ts,tsx}',
      '../../libs/utilities/src/**/*.test.{ts,tsx}',
      '../../libs/modals/src/**/*.test.{ts,tsx}',
      '../../libs/modals/src/**/integration-tests/**/*.test.{ts,tsx}',
      '../../libs/state/src/**/*.test.{js,ts,tsx}',
      '../../libs/cognito-auth/src/**/*.test.{ts,tsx}',
      '../../libs/cognito-auth/src/**/integration-tests/**/*.test.{ts,tsx}',
      '../../libs/reprs-api/src/**/*.test.{ts,tsx}',
      '../../libs/theme/src/**/*.test.{ts,tsx}',
      '../../libs/shared/repr-validation/src/**/*.test.{ts,tsx}',
      '../../libs/shared/repr-model/src/**/*.test.{js,ts}',
      '../../libs/shared/repr-rules/src/**/*.test.{ts,tsx}',
      '../../libs/shared/quota/src/**/*.test.{ts,tsx}',
      '../../libs/shared/subscription/src/**/*.test.{ts,tsx}',
    ],
    coverage: {
      ...coverageConfigDefaults,
      // Monorepo: resolved `@reprman/*` lives under `libs/` outside this app's root.
      // With default `allowExternal: false`, those files are omitted from coverage.
      allowExternal: true,
      provider: 'v8',
      reporter: [['text', { maxCols: 200 }], 'lcov'],
      reportsDirectory: './coverage',
      reportOnFailure: true,
      exclude: [
        ...coverageConfigDefaults.exclude,
        '**/vite-env.d.ts',
        '**/settings/settings.types.ts',
        '**/categories/categories.types.ts',
        '**/reprs/reprs.types.ts',
        '**/reprsQuota/reprsQuota.types.ts',
        '**/modal/modal.types.ts',
        '**/user/user.types.ts',
        '**/ReprsList/ReprsList.types.ts',
        '**/*.test.{ts,tsx}',
        '**/*.testData.ts',
        '**/test-utils/**',
        '**/integration-tests/**',
      ],
      thresholds: {
        perFile: true,
        [`${posixPath(root)}/libs/utilities/src/**`]: {
          lines: 100,
          functions: 100,
          branches: 100,
          statements: 100,
        },
        [`${posixPath(root)}/libs/shared/**/src/**`]: {
          lines: 100,
          functions: 100,
          branches: 100,
          statements: 100,
        },
        '**/*.{helpers,helper}.{ts,tsx}': {
          lines: 100,
          functions: 100,
          branches: 100,
          statements: 100,
        },
        [`${posixPath(root)}/libs/state/src/sagas/reprs.helpers.ts`]: {
          lines: 100,
          functions: 100,
          branches: 100,
          statements: 100,
        },
        // Pure logic: 100% per file (.ts / .js only — not .tsx).
        [`${posixPath(root)}/libs/**/src/**/*.ts`]: {
          lines: 100,
          functions: 100,
          branches: 100,
          statements: 100,
        },
        [`${posixPath(path.resolve(__dirname, 'src'))}/**/*.ts`]: {
          lines: 100,
          functions: 100,
          branches: 100,
          statements: 100,
        },
        // UI (.tsx / .jsx): at least 80% per file in every column.
        [`${posixPath(root)}/libs/**/src/**/*.{tsx,jsx}`]: {
          lines: 80,
          functions: 80,
          branches: 80,
          statements: 80,
        },
        [`${posixPath(path.resolve(__dirname, 'src'))}/**/*.{tsx,jsx}`]: {
          lines: 80,
          functions: 80,
          branches: 80,
          statements: 80,
        },
      },
      // Absolute POSIX globs: `allowExternal` sets test-exclude `relativePath: false`, and
      // backslashes in patterns can prevent matches on Windows.
      include: [
        `${posixPath(path.resolve(__dirname, 'src'))}/**/*.{ts,tsx}`,
        `${posixPath(root)}/libs/*/src/**/*.{ts,tsx}`,
        `${posixPath(root)}/libs/shared/*/src/**/*.{ts,tsx}`,
      ],
    },
  },
})
