import { describe, expect, it } from 'vitest'

import {
  addReprSAC,
  clearAllReprsSAC,
  loadReprsSAC,
  markReprPracticedSAC,
  removeReprSAC,
  storeReprsSAC,
} from './reprs.actions'

describe('reprs saga actions', () => {
  it('creates addReprSAC', () => {
    const repr = {
      id: 'r1',
      title: 'Piece',
      categories: [],
      dateCreated: 0,
      datesPracticed: [],
      comment: '',
      learning: false,
    }
    expect(addReprSAC(repr)).toEqual({ type: 'SAGA/ADD_REPR', payload: repr })
  })

  it('creates loadReprsSAC', () => {
    expect(loadReprsSAC()).toEqual({ type: 'SAGA/LOAD_REPRS' })
  })

  it('creates clearAllReprsSAC', () => {
    expect(clearAllReprsSAC()).toEqual({ type: 'SAGA/CLEAR_ALL_REPRS' })
  })

  it('creates removeReprSAC', () => {
    expect(removeReprSAC('id-1')).toEqual({
      type: 'SAGA/REMOVE_REPR',
      payload: 'id-1',
    })
  })

  it('creates markReprPracticedSAC', () => {
    expect(markReprPracticedSAC('id-1')).toEqual({
      type: 'SAGA/MARK_REPR_PRACTICED',
      payload: 'id-1',
    })
  })

  it('creates storeReprsSAC', () => {
    const reprs = [
      {
        id: 'r1',
        title: 'Piece',
        categories: [],
        dateCreated: 0,
        datesPracticed: [],
        comment: '',
        learning: false,
      },
    ]
    expect(storeReprsSAC(reprs)).toEqual({
      type: 'SAGA/STORE_REPRS',
      payload: reprs,
    })
  })
})
