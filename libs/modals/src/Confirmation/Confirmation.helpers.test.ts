import { describe, expect, it } from 'vitest'
import { put, race, take } from 'redux-saga/effects'
import { setModal } from '@reprman/state/modal'
import {
  ConfirmationModalResponse,
  ModalSelection,
} from '@reprman/modals/ModalContainer/ModalContainer.types'

import { callConfirmation } from './Confirmation.helpers'

describe('callConfirmation', () => {
  const title = 'Confirm'
  const body = 'Are you sure?'

  it('opens confirmation modal', () => {
    const gen = callConfirmation({ title, body })
    expect(gen.next().value).toEqual(
      put(
        setModal({
          selection: ModalSelection.CONFIRMATION,
          props: { title, body },
        })
      )
    )
  })

  it('returns true when YES wins the race', () => {
    const gen = callConfirmation({ title, body })
    gen.next()
    const raceEffect = gen.next().value
    expect(raceEffect).toEqual(
      race([
        take(ConfirmationModalResponse.YES),
        take(ConfirmationModalResponse.NO),
      ])
    )
    const result = gen.next([
      { type: ConfirmationModalResponse.YES },
      undefined,
    ]).value
    expect(result).toBe(true)
    expect(gen.next().done).toBe(true)
  })

  it('returns false when NO wins the race', () => {
    const gen = callConfirmation({ title, body })
    gen.next()
    gen.next()
    const result = gen.next([
      undefined,
      { type: ConfirmationModalResponse.NO },
    ]).value
    expect(result).toBe(false)
  })
})
