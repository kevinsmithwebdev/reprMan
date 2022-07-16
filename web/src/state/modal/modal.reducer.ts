import { createReducer } from '@reduxjs/toolkit'
import { clearModal, setModal } from './modal.actions'
import { Modal } from './modal.types'

const initialState = {
  selection: null,
  props: null,
} as Modal

export default createReducer(initialState, (builder) => {
  builder.addCase(setModal, (state, action) => {
    console.log('asdf1', state)
    console.log('asdf2', action.payload)
    return {
      ...action.payload,
      props: action.payload.props || {},
    }
  })
  builder.addCase(clearModal, () => {
    return initialState
  })
})
