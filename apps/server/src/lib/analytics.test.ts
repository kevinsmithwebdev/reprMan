import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'

const mockSend = jest.fn()

jest.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: {
    from: () => ({ send: mockSend }),
  },
  PutCommand: jest.fn((input) => ({ input })),
}))

process.env.DAILY_USAGE_TABLE_NAME = 'usage-table'

// eslint-disable-next-line import/first -- jest.mock is hoisted; source must load after factory runs
import { trackAction, trackDailyUniqueUser } from './analytics'

describe('analytics', () => {
  const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined)
  const warnSpy = jest
    .spyOn(console, 'warn')
    .mockImplementation(() => undefined)

  beforeEach(() => {
    mockSend.mockReset()
    logSpy.mockClear()
    warnSpy.mockClear()
  })

  afterAll(() => {
    logSpy.mockRestore()
    warnSpy.mockRestore()
  })

  it('trackAction logs an embedded metric', () => {
    trackAction('create')
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('"ActionCount":1')
    )
  })

  it('trackDailyUniqueUser writes a new daily visitor record', async () => {
    mockSend.mockResolvedValue({})
    await trackDailyUniqueUser('user-1')

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          TableName: 'usage-table',
          Item: expect.objectContaining({
            pk: expect.stringMatching(/^DAY#/),
            sk: 'USER#user-1',
          }),
        }),
      })
    )
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('"DailyUniqueVisitors":1')
    )
  })

  it('trackDailyUniqueUser no-ops without table name', async () => {
    const original = process.env.DAILY_USAGE_TABLE_NAME
    delete process.env.DAILY_USAGE_TABLE_NAME

    await new Promise<void>((resolve, reject) => {
      jest.isolateModules(() => {
        const { trackDailyUniqueUser: trackWithoutTable } =
          // eslint-disable-next-line global-require -- jest.isolateModules requires synchronous require
          require('./analytics') as typeof import('./analytics')
        trackWithoutTable('user-1').then(resolve).catch(reject)
      })
    })

    process.env.DAILY_USAGE_TABLE_NAME = original
    expect(mockSend).not.toHaveBeenCalled()
  })

  it('trackDailyUniqueUser ignores duplicate visitor writes', async () => {
    mockSend.mockRejectedValue(
      new ConditionalCheckFailedException({ message: 'exists' } as any)
    )
    await trackDailyUniqueUser('user-1')
    expect(warnSpy).not.toHaveBeenCalled()
  })

  it('trackDailyUniqueUser warns on unexpected errors', async () => {
    mockSend.mockRejectedValue(new Error('network'))
    await trackDailyUniqueUser('user-1')
    expect(warnSpy).toHaveBeenCalledWith(
      '[analytics] failed to write daily unique user',
      expect.any(Error)
    )
  })
})
