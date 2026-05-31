const { join } = require('node:path')
const { pathsToModuleNameMapper } = require('ts-jest')
const { compilerOptions } = require('./tsconfig.json')

module.exports = {
  rootDir: __dirname,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  setupFiles: ['<rootDir>/src/config/env.ts'],

  coverageProvider: 'v8',
  coverageThreshold: {
    global: {
      lines: 40,
    },
  },

  bail: true,
  clearMocks: true,
  displayName: 'unit-tests',
  testMatch: ['<rootDir>/src/modules/**/*.test.ts'],

  preset: 'ts-jest',
  testEnvironment: 'node',

  modulePaths: ['<rootDir>/src'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: join('<rootDir>', compilerOptions.baseUrl),
  }),
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
    '^.+\\.tsx?$': 'ts-jest',
  },
}
