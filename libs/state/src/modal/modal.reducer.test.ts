import { describe, expect, it } from 'vitest'
import { ModalSelection } from '@reprman/modals/ModalContainer/ModalContainer.types'

import reducer from './modal.reducer'
import { clearModal, setModal } from './modal.actions'

const initialState = { selection: null, props: null }

describe('modal.reducer', () => {
  it('returns initial state for unknown action', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState)
  })

  it('setModal applies payload and defaults props to {}', () => {
    const next = reducer(
      initialState,
      setModal({ selection: ModalSelection.CONFIRMATION, props: undefined })
    )
    expect(next).toEqual({ selection: ModalSelection.CONFIRMATION, props: {} })
  })

  it('setModal preserves provided props', () => {
    const props = { title: 'Hi' }
    const next = reducer(
      initialState,
      setModal({ selection: ModalSelection.CONFIRMATION, props })
    )
    expect(next.props).toEqual(props)
  })

  it('clearModal resets to initial state', () => {
    const state = { selection: ModalSelection.INFO, props: { a: 1 } }
    expect(reducer(state, clearModal())).toEqual(initialState)
  })
})
