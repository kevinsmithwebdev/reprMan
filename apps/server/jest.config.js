const { pathsToModuleNameMapper } = require('ts-jest')
const { compilerOptions } = require('../../tsconfig.base.json')
const { jestCoverageNegated } = require('../../scripts/coverage-exclude-globs.mjs')

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
    'esbuild.bundle.js',
    ...jestCoverageNegated,
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [['text', { maxCols: 200 }], 'lcov'],
  coverageProvider: 'v8',
}
