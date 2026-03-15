import { createAction } from '@reduxjs/toolkit'
import { ToastData } from 'types'
import { NAMESPACE } from './toasts.constants'

export const addToastAC = createAction<ToastData>(`${NAMESPACE}/ADD`)
export const removeToastAC = createAction<string>(`${NAMESPACE}/REMOVE`)
export const clearAllToastsAC = createAction(`${NAMESPACE}/CLEAR_ALL`)
