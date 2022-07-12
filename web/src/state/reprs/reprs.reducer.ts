import { createReducer } from '@reduxjs/toolkit'
import { clearSelected, setSelected } from './reprs.actions'
import { Repr } from './reprs.types'
import fixture from './__fixtures/reprs'
// import {Selected} from './reprs.types'

const initialState = fixture

export default createReducer(initialState, (builder) => {
  builder.addCase(clearSelected, () => initialState)
})
