import {createReducer} from '@reduxjs/toolkit'
// import {clearSelected, setSelected} from './user.actions'
import {User} from './user.types';
// import fixture from './__fixtures/reprs.json'
// import {Selected} from './reprs.types'

const initialState = {} as User

export default createReducer(initialState, builder => {
  builder
    .addCase('asdf', () => initialState)
})
