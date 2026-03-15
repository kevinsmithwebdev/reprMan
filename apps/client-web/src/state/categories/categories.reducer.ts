import { createReducer } from '@reduxjs/toolkit'
import { Categories } from 'types'
import {
  clearCategories,
  clearCategoryFilter,
  setCategories,
  setCategoryFilter,
  clearAllCategoryData,
  setCategoryFilterCategories,
  clearCategoryFilterCategories,
  setCategoryFilterText,
  clearCategoryFilterText,
} from './categories.actions'

const initialState = {
  categories: [] as Categories,
  filter: {
    text: '',
    categories: [] as string[],
  },
}

export default createReducer(initialState, (builder) => {
  builder.addCase(clearCategories, (state) => ({
    ...state,
    categories: initialState.categories,
  }))
  builder.addCase(setCategories, (state, { payload: categories }) => ({
    ...state,
    categories,
  }))

  builder.addCase(setCategoryFilter, (state, { payload: filter }) => ({
    ...state,
    filter,
  }))
  builder.addCase(clearCategoryFilter, (state) => ({
    ...state,
    filter: initialState.filter,
  }))

  builder.addCase(setCategoryFilterText, (state, { payload: text }) => ({
    ...state,
    filter: {
      ...state.filter,
      text,
    },
  }))
  builder.addCase(clearCategoryFilterText, (state) => ({
    ...state,
    filter: {
      ...state.filter,
      text: initialState.filter.text,
    },
  }))

  builder.addCase(
    setCategoryFilterCategories,
    (state, { payload: categories }) => ({
      ...state,
      filter: {
        ...state.filter,
        categories,
      },
    })
  )
  builder.addCase(clearCategoryFilterCategories, (state) => ({
    ...state,
    filter: {
      ...state.filter,
      categories: initialState.filter.categories,
    },
  }))

  builder.addCase(clearAllCategoryData, () => initialState)
})
