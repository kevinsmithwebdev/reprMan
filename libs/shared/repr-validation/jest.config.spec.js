const config = require('./jest.config')

describe('shared-repr-validation jest config', () => {
  it('targets spec files in src', () => {
    expect(config.testMatch).toEqual([
      '<rootDir>/src/**/*.spec.ts',
      '<rootDir>/jest.config.spec.js',
    ])
    expect(config.preset).toBe('ts-jest')
  })
})
