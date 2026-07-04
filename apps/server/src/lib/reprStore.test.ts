import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'

const mockSend = jest.fn()

jest.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: {
    from: () => ({ send: mockSend }),
  },
  DeleteCommand: jest.fn((input) => ({ type: 'DeleteCommand', input })),
  GetCommand: jest.fn((input) => ({ type: 'GetCommand', input })),
  PutCommand: jest.fn((input) => ({ type: 'PutCommand', input })),
  QueryCommand: jest.fn((input) => ({ type: 'QueryCommand', input })),
  ScanCommand: jest.fn((input) => ({ type: 'ScanCommand', input })),
  UpdateCommand: jest.fn((input) => ({ type: 'UpdateCommand', input })),
}))

// eslint-disable-next-line import/first -- jest.mock is hoisted; source must load after factory runs
import {
  countReprsForUser,
  deleteRepr,
  findUserIdByStripeCustomerId,
  getUserConfig,
  listReprs,
  markPracticed,
  recordTermsAcceptance,
  reprExists,
  updateUserBillingConfig,
  updateUserPracticeSettings,
  upsertRepr,
} from './reprStore'

const repr = {
  id: 'r1',
  title: 'Title',
  categories: ['a'],
  dateCreated: 100,
  datesPracticed: [200],
  comment: 'ok',
  learning: false,
}

describe('reprStore', () => {
  beforeEach(() => {
    mockSend.mockReset()
  })

  it('listReprs returns repr items', async () => {
    mockSend.mockResolvedValueOnce({
      Items: [{ repr }, { repr: null }],
    })

    await expect(listReprs('user-1')).resolves.toEqual([repr])
  })

  it('getUserConfig returns an existing config row', async () => {
    mockSend.mockResolvedValueOnce({
      Item: { pk: 'USER#user-1', sk: 'CONFIG', maxReprsAllowed: 5 },
    })

    await expect(getUserConfig('user-1')).resolves.toEqual({
      pk: 'USER#user-1',
      sk: 'CONFIG',
      maxReprsAllowed: 5,
    })
  })

  it('getUserConfig creates a config row with trial when missing', async () => {
    const before = Date.now()
    mockSend.mockResolvedValueOnce({}).mockResolvedValueOnce({})

    const config = await getUserConfig('user-1')
    expect(config.pk).toBe('USER#user-1')
    expect(config.sk).toBe('CONFIG')
    expect(config.trialEndsAtMs).toBeGreaterThanOrEqual(
      before + 89 * 86_400_000
    )
    expect(config.trialEndsAtMs).toBeLessThanOrEqual(before + 91 * 86_400_000)
  })

  it('getUserConfig loads config after a concurrent create', async () => {
    mockSend
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(
        new ConditionalCheckFailedException({ message: 'exists' } as any)
      )
      .mockResolvedValueOnce({
        Item: { pk: 'USER#user-1', sk: 'CONFIG', maxReprsAllowed: 3 },
      })

    await expect(getUserConfig('user-1')).resolves.toEqual({
      pk: 'USER#user-1',
      sk: 'CONFIG',
      maxReprsAllowed: 3,
    })
  })

  it('getUserConfig rethrows unexpected create errors', async () => {
    mockSend.mockResolvedValueOnce({}).mockRejectedValueOnce(new Error('boom'))

    await expect(getUserConfig('user-1')).rejects.toThrow('boom')
  })

  it('recordTermsAcceptance updates and returns config', async () => {
    mockSend
      .mockResolvedValueOnce({
        Item: { pk: 'USER#user-1', sk: 'CONFIG' },
      })
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({
        Item: {
          pk: 'USER#user-1',
          sk: 'CONFIG',
          termsAcceptedAt: '2026-01-01T00:00:00.000Z',
          termsVersion: '1',
        },
      })

    await expect(recordTermsAcceptance('user-1', '1')).resolves.toEqual({
      pk: 'USER#user-1',
      sk: 'CONFIG',
      termsAcceptedAt: '2026-01-01T00:00:00.000Z',
      termsVersion: '1',
    })
  })

  it('updateUserPracticeSettings persists settings', async () => {
    mockSend
      .mockResolvedValueOnce({
        Item: { pk: 'USER#user-1', sk: 'CONFIG' },
      })
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({
        Item: {
          pk: 'USER#user-1',
          sk: 'CONFIG',
          practiceDelay: 14,
          warningRatio: 0.7,
        },
      })

    await expect(
      updateUserPracticeSettings('user-1', {
        practiceDelay: 14,
        warningRatio: 0.7,
      })
    ).resolves.toEqual({
      pk: 'USER#user-1',
      sk: 'CONFIG',
      practiceDelay: 14,
      warningRatio: 0.7,
    })
  })

  it('countReprsForUser returns the query count', async () => {
    mockSend.mockResolvedValueOnce({ Count: 4 })
    await expect(countReprsForUser('user-1')).resolves.toBe(4)
  })

  it('countReprsForUser defaults missing count to zero', async () => {
    mockSend.mockResolvedValueOnce({})
    await expect(countReprsForUser('user-1')).resolves.toBe(0)
  })

  it('reprExists reflects whether the item is present', async () => {
    mockSend.mockResolvedValueOnce({ Item: { pk: 'USER#user-1' } })
    await expect(reprExists('user-1', 'r1')).resolves.toBe(true)

    mockSend.mockResolvedValueOnce({})
    await expect(reprExists('user-1', 'r1')).resolves.toBe(false)
  })

  it('upsertRepr reports created vs updated', async () => {
    mockSend.mockResolvedValueOnce({}).mockResolvedValueOnce({})
    await expect(upsertRepr('user-1', repr)).resolves.toBe('created')

    mockSend
      .mockResolvedValueOnce({ Item: { pk: 'USER#user-1' } })
      .mockResolvedValueOnce({})
    await expect(upsertRepr('user-1', repr)).resolves.toBe('updated')
  })

  it('markPracticed returns null when repr is missing', async () => {
    mockSend.mockResolvedValueOnce({})
    await expect(markPracticed('user-1', 'missing')).resolves.toBeNull()
  })

  it('markPracticed prepends a practice timestamp', async () => {
    mockSend
      .mockResolvedValueOnce({ Item: { repr } })
      .mockResolvedValueOnce({ Item: { pk: 'USER#user-1' } })
      .mockResolvedValueOnce({})

    const result = await markPracticed('user-1', 'r1')
    expect(result?.datesPracticed).toHaveLength(2)
    expect(result?.datesPracticed[1]).toBe(200)
  })

  it('updateUserBillingConfig applies SET and REMOVE expressions', async () => {
    mockSend
      .mockResolvedValueOnce({
        Item: { pk: 'USER#user-1', sk: 'CONFIG', stripeCustomerId: 'cus_old' },
      })
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({
        Item: {
          pk: 'USER#user-1',
          sk: 'CONFIG',
          stripeCustomerId: 'cus_new',
          stripeSubscriptionStatus: 'active',
        },
      })

    await expect(
      updateUserBillingConfig('user-1', {
        stripeCustomerId: 'cus_new',
        stripeSubscriptionStatus: 'active',
        stripeCurrentPeriodEndMs: null,
      })
    ).resolves.toEqual({
      pk: 'USER#user-1',
      sk: 'CONFIG',
      stripeCustomerId: 'cus_new',
      stripeSubscriptionStatus: 'active',
    })
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          UpdateExpression: expect.stringMatching(/SET.*REMOVE/s),
        }),
      })
    )
  })

  it('updateUserBillingConfig returns config when update is empty', async () => {
    const config = { pk: 'USER#user-1', sk: 'CONFIG' }
    mockSend
      .mockResolvedValueOnce({ Item: config })
      .mockResolvedValueOnce({ Item: config })
    await expect(updateUserBillingConfig('user-1', {})).resolves.toEqual(config)
    expect(mockSend).toHaveBeenCalledTimes(2)
  })

  it('findUserIdByStripeCustomerId returns user id from GSI query', async () => {
    mockSend.mockResolvedValueOnce({
      Items: [{ pk: 'USER#user-42' }],
    })
    await expect(findUserIdByStripeCustomerId('cus_1')).resolves.toBe('user-42')
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          IndexName: 'StripeCustomerIndex',
          KeyConditionExpression:
            'stripeCustomerId = :customerId AND sk = :configSk',
        }),
      })
    )
  })

  it('findUserIdByStripeCustomerId returns null when not found', async () => {
    mockSend.mockResolvedValueOnce({ Items: [] })
    await expect(
      findUserIdByStripeCustomerId('cus_missing')
    ).resolves.toBeNull()
  })

  it('deleteRepr sends a delete command', async () => {
    mockSend.mockResolvedValueOnce({})
    await deleteRepr('user-1', 'r1')
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          Key: { pk: 'USER#user-1', sk: 'REPR#r1' },
        }),
      })
    )
  })
})
