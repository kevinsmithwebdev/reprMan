import { takeLatest, put, select } from 'redux-saga/effects'
import { LocalStorageModule } from 'modules'
import { selectReprs, setReprs } from 'state/reprs'
import { Reprs } from 'types'
import moment from 'moment'
import { MAX_PRACTICED_DATES } from 'constants/index'
import { MARK_REPR_PRACTICED } from '../reprs.actions'

function* markReprPracticedWorker({ payload: id }: any) {
  const localStorage = LocalStorageModule.getInstance()

  const currentReprs = (yield select(selectReprs)) as Reprs

  const index = currentReprs.findIndex((r) => r.id === id)

  if (index === -1) return

  const newReprs = [...currentReprs]
  const [oldRepr] = newReprs.splice(index, 1)

  const newDatesPracticed = [
    moment.utc().valueOf(),
    ...oldRepr.datesPracticed,
  ].slice(0, MAX_PRACTICED_DATES)

  const newRepr = { ...oldRepr, datesPracticed: newDatesPracticed }
  newReprs.push(newRepr)

  yield put(setReprs(newReprs))
  yield localStorage.setReprs(newReprs)
}

export default [takeLatest(MARK_REPR_PRACTICED, markReprPracticedWorker)]
