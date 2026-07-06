import { describe, expect, it, vi } from 'vitest'
import { runSaga } from 'redux-saga'
import type { Repr } from '@reprman/types'

import { setCategories } from '@reprman/state/categories'
import { setReprs } from '@reprman/state/reprs'
import { ToastLevel } from '@reprman/types'

import { addReprWorker } from './addRepr.saga'

const apiMock = vi.hoisted(() => ({
  isConfigured: false,
  upsertRepr: vi.fn(),
}))

vi.mock('@reprman/reprs-api', () => ({
  get isReprsApiConfigured() {
    return apiMock.isConfigured
  },
  toUserFriendlyApiErrorMessage: (_error: unknown, fallback: string) =>
    fallback,
  ReprsApiModule: {
    getInstance: () => ({
      upsertRepr: apiMock.upsertRepr,
    }),
  },
}))

vi.mock('uuid', () => ({
  v4: () => 'generated-id',
}))

vi.mock('moment', () => ({
  default: {
    utc: () => ({
      valueOf: () => 1_700_000_000_000,
    }),
  },
}))

const newReprPayload = (): Repr => ({
  id: '',
  title: 'New piece',
  categories: [],
  dateCreated: 0,
  datesPracticed: [],
  comment: '',
  learning: false,
})

const existingRepr = (overrides: Partial<Repr> = {}): Repr => ({
  id: 'existing-id',
  title: 'Existing',
  categories: ['jazz'],
  dateCreated: 100,
  datesPracticed: [],
  comment: '',
  learning: false,
  ...overrides,
})

describe('addReprWorker', () => {
  beforeEach(() => {
    apiMock.upsertRepr.mockReset()
    apiMock.isConfigured = false
  })

  it('keeps existing categories when the repr has none', async () => {
    const dispatched: unknown[] = []
    const existingCategories = ['jazz', 'classical']

    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
        getState: () => ({
          reprs: [],
          categories: {
            categories: existingCategories,
            filter: { text: '', categories: [] },
          },
        }),
      },
      addReprWorker,
      { payload: newReprPayload() }
    ).toPromise()

    expect(dispatched).toContainEqual(setReprs(expect.any(Array)))
    expect(dispatched).toContainEqual(setCategories(existingCategories))
  })

  it('merges categories when repr provides them', async () => {
    const dispatched: unknown[] = []

    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
        getState: () => ({
          reprs: [],
          categories: {
            categories: ['a'],
            filter: { text: '', categories: [] },
          },
        }),
      },
      addReprWorker,
      { payload: { ...newReprPayload(), categories: ['b'] } }
    ).toPromise()

    expect(dispatched).toContainEqual(setCategories(['a', 'b']))
  })

  it('updates an existing repr in place', async () => {
    const original = existingRepr()
    const updated = { ...original, title: 'Renamed' }
    const dispatched: unknown[] = []

    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
        getState: () => ({
          reprs: [original],
          categories: { categories: [], filter: { text: '', categories: [] } },
        }),
      },
      addReprWorker,
      { payload: updated }
    ).toPromise()

    expect(dispatched).toContainEqual(setReprs([updated]))
  })

  it('returns early when updating a missing repr id', async () => {
    const dispatched: unknown[] = []

    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
        getState: () => ({
          reprs: [],
          categories: { categories: [], filter: { text: '', categories: [] } },
        }),
      },
      addReprWorker,
      { payload: existingRepr() }
    ).toPromise()

    expect(dispatched).toHaveLength(0)
  })

  it('assigns id and dateCreated for new reprs', async () => {
    const dispatched: unknown[] = []

    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
        getState: () => ({
          reprs: [existingRepr({ id: 'other' })],
          categories: { categories: [], filter: { text: '', categories: [] } },
        }),
      },
      addReprWorker,
      { payload: newReprPayload() }
    ).toPromise()

    const reprs = (dispatched[0] as ReturnType<typeof setReprs>).payload
    expect(reprs[0]).toMatchObject({
      id: 'generated-id',
      dateCreated: 1_700_000_000_000,
      title: 'New piece',
    })
  })

  it('upserts existing repr by id when API is configured', async () => {
    apiMock.isConfigured = true
    apiMock.upsertRepr.mockResolvedValue(undefined)
    const original = existingRepr()
    const updated = { ...original, title: 'Saved' }
    const dispatched: unknown[] = []

    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
        getState: () => ({
          reprs: [original],
          categories: { categories: [], filter: { text: '', categories: [] } },
        }),
      },
      addReprWorker,
      { payload: updated }
    ).toPromise()

    expect(apiMock.upsertRepr).toHaveBeenCalledWith(updated)
    expect(dispatched).toContainEqual(setReprs([updated]))
  })

  it('calls API upsert when configured', async () => {
    apiMock.isConfigured = true
    apiMock.upsertRepr.mockResolvedValue(undefined)
    const dispatched: unknown[] = []

    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
        getState: () => ({
          reprs: [],
          categories: { categories: [], filter: { text: '', categories: [] } },
        }),
      },
      addReprWorker,
      { payload: newReprPayload() }
    ).toPromise()

    expect(apiMock.upsertRepr).toHaveBeenCalled()
    expect(dispatched).toContainEqual(setCategories([]))
  })

  it('restores reprs and shows toast when API upsert fails', async () => {
    apiMock.isConfigured = true
    apiMock.upsertRepr.mockRejectedValue(new Error('fail'))
    const current = [existingRepr()]
    const dispatched: unknown[] = []

    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
        getState: () => ({
          reprs: current,
          categories: { categories: [], filter: { text: '', categories: [] } },
        }),
      },
      addReprWorker,
      { payload: newReprPayload() }
    ).toPromise()

    expect(dispatched).toContainEqual(setReprs(current))
    expect(dispatched).toContainEqual(setCategories([]))
    expect(dispatched).toContainEqual(
      expect.objectContaining({
        type: 'SAGA/MAKE_TOAST',
        payload: expect.objectContaining({ level: ToastLevel.FAIL }),
      })
    )
  })

  it('restores categories when API upsert fails after adding new tags', async () => {
    apiMock.isConfigured = true
    apiMock.upsertRepr.mockRejectedValue(new Error('fail'))
    const current = [existingRepr()]
    const dispatched: unknown[] = []

    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
        getState: () => ({
          reprs: current,
          categories: {
            categories: ['existing-tag'],
            filter: { text: '', categories: [] },
          },
        }),
      },
      addReprWorker,
      {
        payload: { ...newReprPayload(), categories: ['new-tag'] },
      }
    ).toPromise()

    expect(dispatched).toContainEqual(setReprs(current))
    expect(dispatched).toContainEqual(setCategories(['existing-tag']))
  })
})
