const { pathsToModuleNameMapper } = require('ts-jest')
const { compilerOptions } = require('../../../tsconfig.base.json')

module.exports = {
  rootDir: __dirname,
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.test.ts', '<rootDir>/jest.config.test.js'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths || {}, {
    prefix: '<rootDir>/../../../',
  }),
}
