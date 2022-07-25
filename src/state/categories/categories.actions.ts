import { createAction } from '@reduxjs/toolkit'
import { Categories } from 'types'
import { NAMESPACE } from './categories.constants'

export const setCategories = createAction<Categories>(`${NAMESPACE}/SET`)

export const clearCategories = createAction(`${NAMESPACE}/CLEAR`)
