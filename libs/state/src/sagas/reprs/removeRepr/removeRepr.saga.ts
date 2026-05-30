import { ReprsApiModule, isReprsApiConfigured } from '@reprman/reprs-api'
import { call, put, select, takeLatest } from 'redux-saga/effects'
import { selectReprs, setReprs } from '@reprman/state/reprs'
import { Reprs, ToastLevel } from '@reprman/types'
import { callConfirmation } from '@reprman/modals/Confirmation'
import { makeToastSAC } from '@reprman/state/sagas/toast/toast.actions'
import { REMOVE_REPR } from '../reprs.actions'

export function* removeReprWorker({ payload: id }: any) {
  const currentReprs = (yield select(selectReprs)) as Reprs
  const index = currentReprs.findIndex((r) => r.id === id)

  if (index === -1) return

  const { title } = currentReprs[index]

  // @ts-ignore
  const isRemoveConfirmed = yield call(callConfirmation, {
    title: 'Remove Repr Confirmation',
    body: `Are you sure you want to remove the repr titled "${title}"? This is irreversible.`,
  })

  if (isRemoveConfirmed) {
    yield call(removeRepr, currentReprs, index)
  }
}

export default [takeLatest(REMOVE_REPR, removeReprWorker)]

function* removeRepr(currentReprs: Reprs, index: number) {
  const reprsApi = ReprsApiModule.getInstance()
  const newReprs = [...currentReprs]
  const [removed] = newReprs.splice(index, 1)

  yield put(setReprs(newReprs))
  try {
    if (isReprsApiConfigured) {
      yield reprsApi.removeRepr(removed.id)
    }
  } catch {
    yield put(setReprs(currentReprs))
    yield put(
      makeToastSAC({
        body: 'Could not remove repr. Your list was restored.',
        level: ToastLevel.FAIL,
        delay: 6000,
      })
    )
  }
}
