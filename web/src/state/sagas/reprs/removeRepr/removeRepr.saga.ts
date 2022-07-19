import { LocalStorageModule } from 'modules'
import { put, select, takeLatest } from 'redux-saga/effects'
import { selectReprs, setReprs } from 'state/reprs'
import { Reprs } from 'types'
import { REMOVE_REPR } from '../reprs.actions'

function* removeReprWorker({ payload: id }: any) {
  const localStorage = LocalStorageModule.getInstance()

  const currentReprs = (yield select(selectReprs)) as Reprs

  const index = currentReprs.findIndex((r) => r.id === id)

  if (index === -1) return

  const newReprs = [...currentReprs]
  newReprs.splice(index, 1)

  yield put(setReprs(newReprs))
  yield localStorage.setReprs(newReprs)
}

export default [takeLatest(REMOVE_REPR, removeReprWorker)]
