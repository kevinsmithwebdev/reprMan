import { createAction } from '@reduxjs/toolkit'
import { Repr, Reprs } from 'types'
import { NAMESPACE } from './reprs.constants'

export const addRepr = createAction<Repr>(`${NAMESPACE}/ADD`)

export const setReprs = createAction<Reprs>(`${NAMESPACE}/SET_MULTIPLE`)

export const clearAllReprs = createAction(`${NAMESPACE}/CLEAR_ALL`)
