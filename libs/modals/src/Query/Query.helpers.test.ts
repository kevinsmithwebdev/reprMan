import { describe, expect, it } from 'vitest'
import { put, race, take } from 'redux-saga/effects'
import { setModal } from '@reprman/state/modal'
import { ModalSelection } from '@reprman/modals/ModalContainer/ModalContainer.types'

import { callQuery } from './Query.helpers'

describe('callQuery', () => {
  const params = {
    title: 'Choose',
    body: ['Pick one'],
    choiceData: [
      { text: 'A', variant: 'primary' as const },
      { text: 'B', variant: 'secondary' as const },
    ],
  }

  it('opens query modal with action types', () => {
    const gen = callQuery(params)
    const putEffect = gen.next().value
    expect(putEffect).toEqual(
      put(
        setModal({
          selection: ModalSelection.QUERY,
          props: {
            title: params.title,
            body: params.body,
            choiceDataWithActionTypes: [
              { text: 'A', variant: 'primary', actionType: 'MODAL/QUERY_0' },
              { text: 'B', variant: 'secondary', actionType: 'MODAL/QUERY_1' },
            ],
          },
        })
      )
    )
  })

  it('returns index of chosen response', () => {
    const gen = callQuery(params)
    gen.next()
    const raceEffect = gen.next().value
    expect(raceEffect).toEqual(
      race([take('MODAL/QUERY_0'), take('MODAL/QUERY_1')])
    )
    const index = gen.next([undefined, { type: 'MODAL/QUERY_1' }]).value
    expect(index).toBe(1)
    expect(gen.next().done).toBe(true)
  })

  it('returns -1 when no response is truthy', () => {
    const gen = callQuery(params)
    gen.next()
    gen.next()
    const index = gen.next([undefined, undefined]).value
    expect(index).toBe(-1)
  })
})
