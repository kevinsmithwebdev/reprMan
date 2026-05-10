import moment from 'moment'
import { v4 as uuidv4 } from 'uuid'
import { createReducer } from '@reduxjs/toolkit'
import { Reprs } from '@reprman/types'
import { setReprs, addRepr, clearAllReprs, resetReprs } from './reprs.actions'

const initialState = null as Reprs | null

export default createReducer(initialState, (builder) => {
  builder.addCase(addRepr, (state, { payload }) => {
    const newRepr = {
      ...payload,
      id: payload.id || uuidv4(),
      dateCreated: payload.dateCreated || moment.utc().valueOf(),
    }

    return [newRepr, ...(state || [])]
  })

  builder.addCase(setReprs, (_state, { payload: reprs }) => reprs)
  builder.addCase(clearAllReprs, () => [] as Reprs)
  builder.addCase(resetReprs, () => initialState)
})
