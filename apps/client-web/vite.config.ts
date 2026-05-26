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
    css: true,
    include: [
      'src/**/*.{test,spec}.{ts,tsx}',
      'src/**/integration-tests/**/*.{test,spec}.{ts,tsx}',
      '../../libs/components/src/**/*.test.{ts,tsx}',
      '../../libs/components/src/**/integration-tests/**/*.{test,spec}.{ts,tsx}',
      '../../libs/utilities/src/**/*.test.{ts,tsx}',
    ],
    coverage: {
      ...coverageConfigDefaults,
      // Monorepo: resolved `@reprman/*` lives under `libs/` outside this app's root.
      // With default `allowExternal: false`, those files are omitted from coverage.
      allowExternal: true,
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage',
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
