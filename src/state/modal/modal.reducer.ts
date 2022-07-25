import { createReducer } from '@reduxjs/toolkit'
import { clearModal, setModal } from './modal.actions'
import { Modal } from './modal.types'

const initialState = {
  selection: null,
  props: null,
} as Modal

export default createReducer(initialState, (builder) => {
  builder.addCase(setModal, (state, action) => ({
    ...action.payload,
    props: action.payload.props || {},
  }))
  builder.addCase(clearModal, () => {
    return initialState
  })
})
