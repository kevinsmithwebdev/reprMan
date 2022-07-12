import { createReducer } from '@reduxjs/toolkit'
import { clearUser, setUser } from './user.actions'
// import {clearSelected, setSelected} from './user.actions'
import { User } from './user.types'
// import fixture from './__fixtures/reprs.json'
// import {Selected} from './reprs.types'

const initialState = {
  email: '',
} as User

export default createReducer(initialState, (builder) => {
  builder.addCase(setUser, (_state, action) => action.payload)
  builder.addCase(clearUser, () => initialState)
})
