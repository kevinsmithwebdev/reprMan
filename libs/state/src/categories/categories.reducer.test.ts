import { describe, expect, it } from 'vitest'

import reducer from './categories.reducer'
import {
  clearAllCategoryData,
  clearCategories,
  clearCategoryFilter,
  clearCategoryFilterCategories,
  clearCategoryFilterText,
  setCategories,
  setCategoryFilter,
  setCategoryFilterCategories,
  setCategoryFilterText,
} from './categories.actions'

const initialState = {
  categories: [] as string[],
  filter: { text: '', categories: [] as string[] },
}

describe('categories.reducer', () => {
  it('returns initial state for unknown action', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState)
  })

  it('setCategories replaces the category list', () => {
    const next = reducer(initialState, setCategories(['a', 'b']))
    expect(next.categories).toEqual(['a', 'b'])
  })

  it('clearCategories resets categories only', () => {
    const state = { ...initialState, categories: ['x'] }
    expect(reducer(state, clearCategories()).categories).toEqual([])
  })

  it('setCategoryFilter replaces the filter object', () => {
    const filter = { text: 'q', categories: ['jazz'] }
    expect(reducer(initialState, setCategoryFilter(filter)).filter).toEqual(
      filter
    )
  })

  it('clearCategoryFilter resets filter to initial', () => {
    const state = {
      ...initialState,
      filter: { text: 'q', categories: ['x'] },
    }
    expect(reducer(state, clearCategoryFilter()).filter).toEqual(
      initialState.filter
    )
  })

  it('setCategoryFilterText updates text only', () => {
    const state = { ...initialState, filter: { text: '', categories: ['a'] } }
    expect(reducer(state, setCategoryFilterText('hello')).filter).toEqual({
      text: 'hello',
      categories: ['a'],
    })
  })

  it('clearCategoryFilterText clears text only', () => {
    const state = {
      ...initialState,
      filter: { text: 'hello', categories: ['a'] },
    }
    expect(reducer(state, clearCategoryFilterText()).filter.text).toBe('')
  })

  it('setCategoryFilterCategories updates categories only', () => {
    const state = { ...initialState, filter: { text: 'q', categories: [] } }
    expect(
      reducer(state, setCategoryFilterCategories(['rock'])).filter
    ).toEqual({ text: 'q', categories: ['rock'] })
  })

  it('clearCategoryFilterCategories clears filter categories only', () => {
    const state = {
      ...initialState,
      filter: { text: 'q', categories: ['rock'] },
    }
    expect(reducer(state, clearCategoryFilterCategories()).filter).toEqual({
      text: 'q',
      categories: [],
    })
  })

  it('clearAllCategoryData resets entire slice', () => {
    const state = {
      categories: ['a'],
      filter: { text: 'q', categories: ['b'] },
    }
    expect(reducer(state, clearAllCategoryData())).toEqual(initialState)
  })
})
