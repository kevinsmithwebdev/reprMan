import { ToastRequest } from '@reprman/types'

export const MAKE_TOAST = 'SAGA/MAKE_TOAST'

export const makeToastSAC = (payload: ToastRequest) => ({
  type: MAKE_TOAST,
  payload,
})
