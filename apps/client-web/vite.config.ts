/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from 'path'
import { coverageConfigDefaults } from 'vitest/config'

const root = path.resolve(__dirname, '../..')

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
  },
  preview: {
    port: 3000,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    css: true,
    coverage: {
      ...coverageConfigDefaults,
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage',
      // Only workspace sources — never instrument or report `node_modules`
      // (including nested hoists like `.pnpm/.../node_modules/...`).
      include: [
        'src/**/*.{ts,tsx}',
        '../../libs/*/src/**/*.{ts,tsx}',
        '../../libs/shared/*/src/**/*.{ts,tsx}',
      ],
    },
  },
})
