export {}

describe('reprStore env guard', () => {
  const originalTableName = process.env.REPRS_TABLE_NAME

  afterEach(() => {
    process.env.REPRS_TABLE_NAME = originalTableName
    jest.resetModules()
  })

  it('throws when REPRS_TABLE_NAME is missing', () => {
    delete process.env.REPRS_TABLE_NAME
    jest.isolateModules(() => {
      expect(() => require('./reprStore')).toThrow(/REPRS_TABLE_NAME/)
    })
  })
})
