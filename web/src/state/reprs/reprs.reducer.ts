/* eslint-disable no-console */
import moment from 'moment'
import { v4 as uuidv4 } from 'uuid'
import { createReducer } from '@reduxjs/toolkit'
import { getUniqueArray } from 'helpers'
import { addRepr } from './reprs.actions'

import fixture from './__FIXTURES__/reprs1'

const initialState = {
  reprs: fixture,
  categories: ['Classical', 'Jazz', 'Pop', 'Rock'],
}

export default createReducer(initialState, (builder) => {
  builder.addCase(addRepr, (state, { payload }) => {
    const newRepr = {
      ...payload,
      id: payload.id || uuidv4(),
      dateCreated: payload.dateCreated || moment.utc().valueOf(),
    }

    return {
      ...state,
      reprs: [newRepr, ...state.reprs],
      categories: getUniqueArray([
        ...payload.categories,
        ...state.categories,
      ]).sort(),
    }
  })
})
