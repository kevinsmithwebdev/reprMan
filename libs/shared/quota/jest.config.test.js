const config = require('./jest.config')

describe('shared-quota jest config', () => {
  it('targets test files in src', () => {
    expect(config.testMatch).toEqual([
      '<rootDir>/src/**/*.test.ts',
      '<rootDir>/jest.config.test.js',
    ])
    expect(config.preset).toBe('ts-jest')
  })
})
