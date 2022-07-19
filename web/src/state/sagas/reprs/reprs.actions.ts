import { Repr } from "types"

export const ADD_REPR = 'SAGA/ADD_REPR'
export const addReprSAC = (repr: Repr) => ({
  type: ADD_REPR,
  payload: repr
})

export const LOAD_REPRS = 'SAGA/LOAD_REPRS'
export const loadReprsSAC = () => ({ type: LOAD_REPRS })

export const CLEAR_ALL_REPRS = 'SAGA/CLEAR_ALL_REPRS'
export const clearAllReprsSAC = () => ({ type: CLEAR_ALL_REPRS })


export const REMOVE_REPR = 'SAGA/REMOVE_REPR'
export const removeReprSAC = (id: string) => ({ type: REMOVE_REPR, payload: id })
