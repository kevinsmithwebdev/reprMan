export {}

describe('reprStore env guard', () => {
  const originalTableName = process.env.REPRS_TABLE_NAME
  const originalUsageTableName = process.env.DAILY_USAGE_TABLE_NAME

  afterEach(() => {
    process.env.REPRS_TABLE_NAME = originalTableName
    process.env.DAILY_USAGE_TABLE_NAME = originalUsageTableName
    jest.resetModules()
  })

  it('throws when REPRS_TABLE_NAME is missing', () => {
    delete process.env.REPRS_TABLE_NAME
    jest.isolateModules(() => {
      // eslint-disable-next-line global-require -- jest.isolateModules requires synchronous require
      expect(() => require('./reprStore')).toThrow(/REPRS_TABLE_NAME/)
    })
  })

  it('throws when DAILY_USAGE_TABLE_NAME is missing', () => {
    delete process.env.DAILY_USAGE_TABLE_NAME
    jest.isolateModules(() => {
      // eslint-disable-next-line global-require -- jest.isolateModules requires synchronous require
      expect(() => require('./reprStore')).toThrow(/DAILY_USAGE_TABLE_NAME/)
    })
  })
})
