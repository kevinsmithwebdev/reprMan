/* eslint-disable no-console */
import moment from 'moment'
import { v4 as uuidv4 } from 'uuid'
import { createReducer } from '@reduxjs/toolkit'
import { getUniqueArray } from 'helpers'
import { Reprs } from 'types'
import { setReprs, addRepr, clearAllReprs } from './reprs.actions'

const initialState = {
  reprs: [] as Reprs,
  categories: [] as string[],
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

  builder.addCase(setReprs, (state, {payload: reprs}) => ({ ...state, reprs }))

  builder.addCase(clearAllReprs, () => initialState)
})
