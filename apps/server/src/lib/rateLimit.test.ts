import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'

const mockSend = jest.fn()

jest.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: {
    from: () => ({ send: mockSend }),
  },
  UpdateCommand: jest.fn((input) => ({ input })),
}))

process.env.DAILY_USAGE_TABLE_NAME = 'usage-table'

// eslint-disable-next-line import/first -- jest.mock is hoisted; source must load after factory runs
import { enforceUserActionRateLimit } from './rateLimit'

describe('rateLimit', () => {
  beforeEach(() => {
    mockSend.mockReset()
    delete process.env.RATE_LIMIT_GLOBAL_PER_DAY
    delete process.env.RATE_LIMIT_READ_PER_HOUR
    delete process.env.RATE_LIMIT_READ_PER_DAY
  })

  it('consumes global and action windows when allowed', async () => {
    mockSend.mockResolvedValue({})
    const blocked = await enforceUserActionRateLimit(
      'user-1',
      'read',
      new Date('2026-06-02T10:15:00.000Z')
    )

    expect(blocked).toBeNull()
    expect(mockSend).toHaveBeenCalledTimes(3)
    expect(mockSend).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        input: expect.objectContaining({
          Key: {
            pk: 'RL#USER#user-1#W#day#B#2026-06-02',
            sk: 'ACTION#GLOBAL',
          },
        }),
      })
    )
    expect(mockSend).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        input: expect.objectContaining({
          Key: {
            pk: 'RL#USER#user-1#W#hour#B#2026-06-02T10',
            sk: 'ACTION#read',
          },
        }),
      })
    )
  })

  it('returns rate limit metadata when threshold is exceeded', async () => {
    mockSend
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(
        new ConditionalCheckFailedException({ message: 'too many' } as any)
      )
    const blocked = await enforceUserActionRateLimit(
      'user-1',
      'read',
      new Date('2026-06-02T10:15:00.000Z')
    )

    expect(blocked).toEqual({
      key: 'read/hour',
      max: 300,
      window: 'hour',
      retryAfterSeconds: 2700,
    })
    expect(mockSend).toHaveBeenCalledTimes(2)
  })

  it('throws when daily usage table env is missing', () => {
    const original = process.env.DAILY_USAGE_TABLE_NAME
    delete process.env.DAILY_USAGE_TABLE_NAME

    jest.isolateModules(() => {
      expect(() => {
        // eslint-disable-next-line global-require -- jest.isolateModules requires synchronous require
        require('./rateLimit')
      }).toThrow(/DAILY_USAGE_TABLE_NAME/)
    })

    process.env.DAILY_USAGE_TABLE_NAME = original
  })

  it('supports env overrides for limits', async () => {
    process.env.RATE_LIMIT_GLOBAL_PER_DAY = '2'
    process.env.RATE_LIMIT_READ_PER_HOUR = '1'
    process.env.RATE_LIMIT_READ_PER_DAY = '3'
    mockSend.mockRejectedValueOnce(
      new ConditionalCheckFailedException({ message: 'global hit' } as any)
    )

    const blocked = await enforceUserActionRateLimit(
      'user-1',
      'read',
      new Date('2026-06-02T10:15:00.000Z')
    )
    expect(blocked).toEqual({
      key: 'global/day',
      max: 2,
      window: 'day',
      retryAfterSeconds: 49500,
    })
  })
})
