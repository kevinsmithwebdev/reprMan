import { describe, expect, it } from 'vitest'
import { ToastLevel } from '@reprman/types'

import reducer from './toasts.reducer'
import { addToastAC, clearAllToastsAC, removeToastAC } from './toasts.actions'

const toast = {
  id: 't1',
  title: 'Title',
  body: 'Body',
  level: ToastLevel.INFO,
}

describe('toasts.reducer', () => {
  it('returns initial state for unknown action', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual([])
  })

  it('addToastAC appends a toast', () => {
    expect(reducer([], addToastAC(toast))).toEqual([toast])
  })

  it('removeToastAC removes by id', () => {
    const state = [toast, { ...toast, id: 't2' }]
    expect(reducer(state, removeToastAC('t1'))).toEqual([
      { ...toast, id: 't2' },
    ])
  })

  it('removeToastAC is a no-op when id is missing', () => {
    const state = [toast]
    expect(reducer(state, removeToastAC('missing'))).toBe(state)
  })

  it('clearAllToastsAC clears the list', () => {
    expect(reducer([toast], clearAllToastsAC())).toEqual([])
  })
})
