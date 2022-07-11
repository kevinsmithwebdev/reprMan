import {createReducer} from '@reduxjs/toolkit'
// import {clearSelected, setSelected} from './settings.actions'
import {Settings} from './settings.types';
// import fixture from './__fixtures/reprs.json'
// import {Selected} from './reprs.types'

const initialState = {
  daysOverdueTrigger: 30,
} as Settings

export default createReducer(initialState, builder => {
  builder
    .addCase('asdf', () => {
      console.log('asdf reducer2')
      return initialState
    })
})
