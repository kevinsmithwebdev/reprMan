import * as analytics from '../lib/analytics'
import * as reprStore from '../lib/reprStore'
import {
  deleteReprHandler,
  getReprsHandler,
  markReprPracticedHandler,
  putReprHandler,
} from './reprs'

const authEvent = (overrides: Record<string, unknown> = {}) =>
  ({
    requestContext: {
      authorizer: { jwt: { claims: { sub: 'user-1' } } },
      http: { method: 'GET' },
    },
    rawPath: '/reprs',
    ...overrides,
  }) as any

const validRepr = {
  id: 'r1',
  title: 'Title',
  categories: ['a'],
  dateCreated: 100,
  datesPracticed: [200],
  comment: 'ok',
}

describe('repr handlers', () => {
  let trackDailyUniqueUserSpy: jest.SpiedFunction<typeof analytics.trackDailyUniqueUser>
  let trackActionSpy: jest.SpiedFunction<typeof analytics.trackAction>

  beforeEach(() => {
    trackDailyUniqueUserSpy = jest
      .spyOn(analytics, 'trackDailyUniqueUser')
      .mockResolvedValue(undefined)
    trackActionSpy = jest.spyOn(analytics, 'trackAction').mockImplementation(() => undefined)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('getReprsHandler', () => {
    it('returns reprs for the authenticated user', async () => {
      jest.spyOn(reprStore, 'listReprs').mockResolvedValue([validRepr as any])
      jest.spyOn(reprStore, 'getUserConfig').mockResolvedValue({
        pk: 'USER#user-1',
        sk: 'CONFIG',
      })

      const res = await getReprsHandler(authEvent())
      expect(res.statusCode).toBe(200)
      expect(JSON.parse(res.body)).toEqual({ reprs: [validRepr] })
      expect(trackDailyUniqueUserSpy).toHaveBeenCalledWith('user-1')
    })

    it('returns 401 when user is not authenticated', async () => {
      const res = await getReprsHandler({ requestContext: {} } as any)
      expect(res.statusCode).toBe(401)
    })
  })

  describe('putReprHandler', () => {
    beforeEach(() => {
      jest.spyOn(reprStore, 'reprExists').mockResolvedValue(false)
      jest.spyOn(reprStore, 'getUserConfig').mockResolvedValue({
        pk: 'USER#user-1',
        sk: 'CONFIG',
      })
      jest.spyOn(reprStore, 'countReprsForUser').mockResolvedValue(0)
      jest.spyOn(reprStore, 'upsertRepr').mockResolvedValue('created')
    })

    it('creates a repr when under the quota', async () => {
      const res = await putReprHandler(
        authEvent({
          body: JSON.stringify(validRepr),
          pathParameters: { id: 'r1' },
        })
      )

      expect(res.statusCode).toBe(200)
      expect(trackActionSpy).toHaveBeenCalledWith('create')
    })

    it('tracks edits for existing reprs', async () => {
      jest.spyOn(reprStore, 'reprExists').mockResolvedValue(true)
      jest.spyOn(reprStore, 'upsertRepr').mockResolvedValue('updated')

      await putReprHandler(
        authEvent({
          body: JSON.stringify(validRepr),
          pathParameters: { id: 'r1' },
        })
      )

      expect(trackActionSpy).toHaveBeenCalledWith('edit')
    })

    it('returns 400 when path id and repr id differ', async () => {
      const res = await putReprHandler(
        authEvent({
          body: JSON.stringify(validRepr),
          pathParameters: { id: 'other' },
        })
      )

      expect(res.statusCode).toBe(400)
    })

    it('returns 403 when the repr quota is exceeded', async () => {
      jest.spyOn(reprStore, 'getUserConfig').mockResolvedValue({
        pk: 'USER#user-1',
        sk: 'CONFIG',
        maxReprsAllowed: 2,
      })
      jest.spyOn(reprStore, 'countReprsForUser').mockResolvedValue(2)

      const res = await putReprHandler(
        authEvent({
          body: JSON.stringify(validRepr),
          pathParameters: { id: 'r1' },
        })
      )

      expect(res.statusCode).toBe(403)
      expect(JSON.parse(res.body).code).toBe('REPR_LIMIT_EXCEEDED')
    })

    it('allows unlimited reprs when maxReprsAllowed is null', async () => {
      const countSpy = jest.spyOn(reprStore, 'countReprsForUser').mockResolvedValue(99)
      jest.spyOn(reprStore, 'getUserConfig').mockResolvedValue({
        pk: 'USER#user-1',
        sk: 'CONFIG',
        maxReprsAllowed: null,
      })

      const res = await putReprHandler(
        authEvent({
          body: JSON.stringify(validRepr),
          pathParameters: { id: 'r1' },
        })
      )

      expect(res.statusCode).toBe(200)
      expect(countSpy).not.toHaveBeenCalled()
    })

    it('returns 400 for invalid JSON', async () => {
      const res = await putReprHandler(
        authEvent({
          body: '{',
          pathParameters: { id: 'r1' },
        })
      )

      expect(res.statusCode).toBe(400)
    })

    it('returns 400 when path id is missing', async () => {
      const res = await putReprHandler(
        authEvent({
          body: JSON.stringify(validRepr),
          pathParameters: {},
        })
      )

      expect(res.statusCode).toBe(400)
    })

    it('accepts a missing body as an empty object', async () => {
      const res = await putReprHandler(
        authEvent({
          pathParameters: { id: 'r1' },
        })
      )

      expect(res.statusCode).toBe(400)
    })
  })

  describe('markReprPracticedHandler', () => {
    it('returns 400 when repr id is missing', async () => {
      const res = await markReprPracticedHandler(authEvent({ pathParameters: {} }))
      expect(res.statusCode).toBe(400)
    })

    it('returns 404 when repr is not found', async () => {
      jest.spyOn(reprStore, 'markPracticed').mockResolvedValue(null)
      const res = await markReprPracticedHandler(
        authEvent({ pathParameters: { id: 'missing' } })
      )
      expect(res.statusCode).toBe(404)
    })

    it('marks a repr practiced and tracks the action', async () => {
      jest.spyOn(reprStore, 'markPracticed').mockResolvedValue(validRepr as any)
      const res = await markReprPracticedHandler(
        authEvent({ pathParameters: { id: 'r1' } })
      )

      expect(res.statusCode).toBe(200)
      expect(trackActionSpy).toHaveBeenCalledWith('practice')
    })

    it('returns 401 when user is not authenticated', async () => {
      const res = await markReprPracticedHandler({
        requestContext: {},
        pathParameters: { id: 'r1' },
      } as any)
      expect(res.statusCode).toBe(401)
    })
  })

  describe('deleteReprHandler', () => {
    it('returns 400 when repr id is missing', async () => {
      const res = await deleteReprHandler(authEvent({ pathParameters: {} }))
      expect(res.statusCode).toBe(400)
    })

    it('deletes a repr and tracks the action', async () => {
      jest.spyOn(reprStore, 'deleteRepr').mockResolvedValue(undefined)
      const res = await deleteReprHandler(
        authEvent({ pathParameters: { id: 'r1' } })
      )

      expect(res.statusCode).toBe(200)
      expect(trackActionSpy).toHaveBeenCalledWith('delete')
    })

    it('returns 401 when user is not authenticated', async () => {
      const res = await deleteReprHandler({
        requestContext: {},
        pathParameters: { id: 'r1' },
      } as any)
      expect(res.statusCode).toBe(401)
    })
  })
})
