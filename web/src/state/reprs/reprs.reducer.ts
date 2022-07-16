import { createReducer } from '@reduxjs/toolkit'
import { clearSelected } from './reprs.actions'

import fixture from './__FIXTURES__/reprs1'
// import {Selected} from './reprs.types'

const initialState = fixture

export default createReducer(initialState, (builder) => {
  builder.addCase(clearSelected, () => initialState)
})
