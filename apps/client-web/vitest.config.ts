/// <reference types="vitest/config" />
import path from 'node:path'
import { defineConfig } from 'vitest/config'
import { coverageConfigDefaults } from 'vitest/config'
import { vitestCoverageExclude } from '../../scripts/coverage-exclude-globs.mjs'

const root = path.resolve(__dirname, '../..')
const posixPath = (p: string) => p.replaceAll('\\', '/')

const lib = (name: string) => path.resolve(root, 'libs', name, 'src/index.ts')
const libRoot = (name: string) => path.resolve(root, 'libs', name, 'src')
const sharedLib = (name: string) =>
  path.resolve(root, 'libs/shared', name, 'src/index.ts')

export default defineConfig({
  resolve: {
    alias: [
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
      {
        find: /^@client-web\/test-utils\/(.+)$/,
        replacement: `${path.resolve(__dirname, 'src/test-utils')}/$1`,
      },
      {
        find: /^@client-web\/test-utils$/,
        replacement: path.resolve(__dirname, 'src/test-utils/index.ts'),
      },
      {
        find: /^@reprman\/localization\/languageDetectionCore$/,
        replacement: path.resolve(
          root,
          'libs/localization/src/languageDetectionCore.ts'
        ),
      },
      {
        find: /^@reprman\/localization\/server$/,
        replacement: path.resolve(
          root,
          'libs/localization/src/server/index.ts'
        ),
      },
      {
        find: /^@reprman\/localization\/src\/server$/,
        replacement: path.resolve(
          root,
          'libs/localization/src/server/index.ts'
        ),
      },
      ...[
        'components',
        'components-mobile',
        'modals',
        'modals-mobile',
        'state',
        'cognito-auth',
        'localization',
        'reprs-api',
        'utilities',
        'constants',
        'types',
        'theme',
        'client-config',
        'client-platform',
      ].flatMap((name) => [
        {
          find: new RegExp(`^@reprman/${name}/(.+)$`),
          replacement: `${libRoot(name)}/$1`,
        },
        { find: new RegExp(`^@reprman/${name}$`), replacement: lib(name) },
      ]),
      {
        find: /^@reprman\/client-config\/createNextClientConfig$/,
        replacement: path.resolve(
          root,
          'libs/client-config/src/createNextClientConfig.ts'
        ),
      },
      {
        find: /^@reprman\/client-platform\/storage\.web$/,
        replacement: path.resolve(
          root,
          'libs/client-platform/src/storage.web.ts'
        ),
      },
    ],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    globalSetup: ['./scripts/vitest-global-setup.mjs'],
    pool: 'forks',
    css: false,
    include: [
      'src/**/*.test.{ts,tsx}',
      '../../libs/components/src/**/*.test.{ts,tsx}',
      '../../libs/components/src/**/integration-tests/**/*.test.{ts,tsx}',
      '../../libs/utilities/src/**/*.test.{ts,tsx}',
      '../../libs/modals/src/**/*.test.{ts,tsx}',
      '../../libs/modals/src/**/integration-tests/**/*.test.{ts,tsx}',
      '../../libs/state/src/**/*.test.{js,ts,tsx}',
      '../../libs/cognito-auth/src/**/*.test.{ts,tsx}',
      '../../libs/cognito-auth/src/**/integration-tests/**/*.test.{ts,tsx}',
      '../../libs/reprs-api/src/**/*.test.{ts,tsx}',
      '../../libs/client-config/src/**/*.test.{ts,tsx}',
      '../../libs/shared/repr-validation/src/**/*.test.{ts,tsx}',
      '../../libs/shared/repr-model/src/**/*.test.{js,ts}',
      '../../libs/shared/repr-rules/src/**/*.test.{ts,tsx}',
      '../../libs/shared/quota/src/**/*.test.{ts,tsx}',
      '../../libs/shared/subscription/src/**/*.test.{ts,tsx}',
    ],
    coverage: {
      ...coverageConfigDefaults,
      allowExternal: true,
      provider: 'v8',
      reporter: [['text', { maxCols: 200 }], 'lcov'],
      reportsDirectory: './coverage',
      reportOnFailure: true,
      exclude: [...coverageConfigDefaults.exclude, ...vitestCoverageExclude],
      include: [
        `${posixPath(path.resolve(__dirname, 'src'))}/**/*.{ts,tsx}`,
        `${posixPath(root)}/libs/*/src/**/*.{ts,tsx}`,
        `${posixPath(root)}/libs/shared/*/src/**/*.{ts,tsx}`,
      ],
    },
  },
})
