import { createReducer } from '@reduxjs/toolkit'
import { Categories } from 'types'
import { clearCategories, setCategories } from './categories.actions'

const initialState = [] as Categories

export default createReducer(initialState, (builder) => {
  builder.addCase(clearCategories, () => initialState)
  builder.addCase(setCategories, (_state, { payload }) => payload)
})
