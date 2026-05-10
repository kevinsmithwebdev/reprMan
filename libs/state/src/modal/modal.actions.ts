import { createAction } from '@reduxjs/toolkit'
import { NAMESPACE } from './modal.constants'
import { Modal } from './modal.types'

export const setModal = createAction<Modal>(`${NAMESPACE}/SET`)
export const clearModal = createAction(`${NAMESPACE}/CLEAR`)
