import { takeLatest, put, select } from 'redux-saga/effects'
import {
  ReprsApiModule,
  isReprsApiConfigured,
  toUserFriendlyApiErrorMessage,
} from '@reprman/reprs-api'
import { selectReprs, setReprs } from '@reprman/state/reprs'
import { Reprs, ToastLevel } from '@reprman/types'
import moment from 'moment'
import { withPracticeApplied } from '@reprman/shared/repr-rules'
import { makeToastSAC } from '@reprman/state/sagas/toast/toast.actions'
import { MARK_REPR_PRACTICED } from '../reprs.actions'

export function* markReprPracticedWorker({ payload: id }: any) {
  const reprsApi = ReprsApiModule.getInstance()

  const currentReprs = (yield select(selectReprs)) as Reprs

  const index = currentReprs.findIndex((r) => r.id === id)

  if (index === -1) return

  const newReprs = [...currentReprs]
  const [oldRepr] = newReprs.splice(index, 1)

  const newRepr = withPracticeApplied(oldRepr, moment.utc().valueOf())
  newReprs.push(newRepr)

  yield put(setReprs(newReprs))
  try {
    if (isReprsApiConfigured) {
      yield reprsApi.upsertRepr(newRepr)
    }
  } catch (error: unknown) {
    yield put(setReprs(currentReprs))
    yield put(
      makeToastSAC({
        body: toUserFriendlyApiErrorMessage(
          error,
          'Could not mark repr practiced. Your list was restored.'
        ),
        level: ToastLevel.FAIL,
        delay: 6000,
      })
    )
  }
}

export default [takeLatest(MARK_REPR_PRACTICED, markReprPracticedWorker)]
