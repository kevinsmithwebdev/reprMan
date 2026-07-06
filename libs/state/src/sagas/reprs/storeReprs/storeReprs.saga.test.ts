import { describe, expect, it, vi } from 'vitest'
import { runSaga } from 'redux-saga'

import { setCategories } from '@reprman/state/categories'
import { setReprs } from '@reprman/state/reprs'
import { storeReprsWorker } from './storeReprs.saga'

vi.mock('uuid', () => ({ v4: () => 'generated-id' }))
vi.mock('moment', () => {
  const valueOf = () => 1_700_000_000_000
  const utc = () => ({ valueOf })
  const momentFn = Object.assign(() => ({ utc }), { utc: () => ({ valueOf }) })
  return { default: momentFn }
})

describe('storeReprsWorker', () => {
  it('cleans reprs and derives categories', async () => {
    const raw = [
      {
        title: 'Older',
        categories: ['music'],
        dateCreated: 0,
        datesPracticed: [1],
        comment: '',
        learning: false,
      },
      {
        id: 'existing',
        title: 'Newer',
        categories: ['jazz'],
        dateCreated: 5,
        datesPracticed: [3, 2],
        comment: '',
        learning: true,
      },
    ]

    const dispatched: unknown[] = []
    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
        getState: () => ({}),
      },
      storeReprsWorker,
      { payload: raw }
    ).toPromise()

    expect(dispatched).toContainEqual(setReprs(expect.any(Array)))
    expect(dispatched).toContainEqual(setCategories(['jazz', 'music']))
    const cleaned = (
      dispatched.find(
        (a) => (a as { type: string }).type === 'reprs/SET_MULTIPLE'
      ) as ReturnType<typeof setReprs> | undefined
    )?.payload
    expect(cleaned?.[0].datesPracticed).toEqual([1])
    expect(cleaned?.[1]).toMatchObject({
      id: 'existing',
      datesPracticed: [3, 2],
      learning: true,
    })
  })

  it('sorts reprs with empty datesPracticed as zero', async () => {
    const raw = [
      {
        id: 'no-dates',
        title: 'No practice',
        categories: [],
        dateCreated: 1,
        datesPracticed: [],
        comment: '',
        learning: false,
      },
      {
        id: 'with-dates',
        title: 'Practiced',
        categories: [],
        dateCreated: 2,
        datesPracticed: [5],
        comment: '',
        learning: false,
      },
    ]

    const dispatched: unknown[] = []
    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
        getState: () => ({}),
      },
      storeReprsWorker,
      { payload: raw }
    ).toPromise()

    const cleaned = (
      dispatched.find((a) => (a as { type: string }).type.includes('/SET')) as
        | ReturnType<typeof setReprs>
        | undefined
    )?.payload
    expect(cleaned?.[0].id).toBe('no-dates')
    expect(cleaned?.[1].id).toBe('with-dates')
  })
})
