import { createAction } from '@reduxjs/toolkit'
import { NAMESPACE } from './user.constants'
import { User } from './user.types'

export const clearUser = createAction(`${NAMESPACE}/CLEAR`)
export const setUser = createAction<User>(`${NAMESPACE}/SET`)
