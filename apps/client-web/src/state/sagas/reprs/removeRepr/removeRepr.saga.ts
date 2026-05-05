import { LocalStorageModule, ReprsApiModule } from 'modules'
import { isReprsApiConfigured } from 'modules/ReprsApi'
import { call, put, select, takeLatest } from 'redux-saga/effects'
import { selectReprs, setReprs } from 'state/reprs'
import { Reprs } from 'types'
import { callConfirmation } from 'modals/Confirmation'
import { REMOVE_REPR } from '../reprs.actions'

// @ts-ignore
function* removeReprWorker({ payload: id }: any) {
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
  const localStorage = LocalStorageModule.getInstance()
  const newReprs = [...currentReprs]
  const [removed] = newReprs.splice(index, 1)

  yield put(setReprs(newReprs))
  if (isReprsApiConfigured) {
    yield reprsApi.removeRepr(removed.id)
  } else {
    yield localStorage.setReprs(newReprs)
  }
}
