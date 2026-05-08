import { takeLatest, put, select } from 'redux-saga/effects'
import { ReprsApiModule } from 'modules'
import { isReprsApiConfigured } from 'modules/ReprsApi'
import { selectReprs, setReprs } from 'state/reprs'
import { Reprs, ToastLevel } from 'types'
import moment from 'moment'
import { MAX_PRACTICED_DATES } from 'constants/index'
import { makeToastSAC } from 'state/sagas/toast/toast.actions'
import { MARK_REPR_PRACTICED } from '../reprs.actions'

function* markReprPracticedWorker({ payload: id }: any) {
  const reprsApi = ReprsApiModule.getInstance()

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
  try {
    if (isReprsApiConfigured) {
      yield reprsApi.upsertRepr(newRepr)
    }
  } catch {
    yield put(setReprs(currentReprs))
    yield put(
      makeToastSAC({
        body: 'Could not mark repr practiced. Your list was restored.',
        level: ToastLevel.FAIL,
        delay: 6000,
      })
    )
  }
}

export default [takeLatest(MARK_REPR_PRACTICED, markReprPracticedWorker)]
