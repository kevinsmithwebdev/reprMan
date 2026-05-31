const { pathsToModuleNameMapper } = require('ts-jest')
const { compilerOptions } = require('../../tsconfig.base.json')

module.exports = {
  rootDir: __dirname,
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.test.ts', '<rootDir>/esbuild.config.test.js'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  setupFiles: ['<rootDir>/jest.setup-env.js'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths || {}, {
    prefix: '<rootDir>/../../',
  }),
  transform: {},
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/handlers/index.ts',
    'esbuild.bundle.js',
    'esbuild.config.mjs',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [['text', { maxCols: 200 }], 'lcov'],
  coverageProvider: 'v8',
}
