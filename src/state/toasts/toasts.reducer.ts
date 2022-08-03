import { createReducer } from '@reduxjs/toolkit'
import { ToastData } from 'types'
import { addToastAC, removeToastAC, clearAllToastsAC } from './toasts.actions'

const initialState = [] as ToastData[]

export default createReducer(initialState, (builder) => {
  builder.addCase(addToastAC, (state, { payload: toastData }) => [
    ...state,
    toastData,
  ])

  builder.addCase(removeToastAC, (state, { payload: id }) => {
    const index = state.findIndex((t) => t.id === id)

    if (index === -1) return state

    const newState = [...state]
    newState.splice(index, 1)
    return newState
  })

  builder.addCase(clearAllToastsAC, () => initialState)
})
