import { createAction } from '@reduxjs/toolkit'
import { NAMESPACE } from './reprs.constants'
import { Repr } from './reprs.types'

export const addRepr = createAction<Repr>(`${NAMESPACE}/ADD`)
