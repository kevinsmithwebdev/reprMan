import { put, select, takeLatest } from 'redux-saga/effects'
import moment from 'moment'
import { v4 as uuidv4 } from 'uuid'
import { LocalStorageModule } from 'modules'
import { selectReprs, setReprs } from 'state/reprs'
import { Reprs } from 'types'
import { ADD_REPR } from '../reprs.actions'

function* addReprWorker({payload: repr}: any) {
  const localStorage = LocalStorageModule.getInstance()

  const currentReprs = (yield select(selectReprs)) as Reprs

  let newReprs = [] as Reprs

  if (repr.id) { // existing repr
    const index = currentReprs.findIndex(r => r.id === repr.id)

    if (index === -1) return

    newReprs = [...currentReprs]
    newReprs[index] = repr
  } else { // new repr
    const newRepr = {
      ...repr,
      id: uuidv4(),
      dateCreated: moment.utc().valueOf(),
    }
    newReprs = [newRepr, ...currentReprs]
  }

  yield put(setReprs(newReprs))
  yield localStorage.setReprs(newReprs)
}

  export default [takeLatest(ADD_REPR, addReprWorker)]
