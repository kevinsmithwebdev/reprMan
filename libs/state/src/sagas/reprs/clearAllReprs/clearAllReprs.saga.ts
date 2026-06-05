import LocalizationModule from '@reprman/localization/Localization.module'
import { ReprsApiModule, isReprsApiConfigured } from '@reprman/reprs-api'
import { clearAllReprs } from '@reprman/state/reprs'
import { selectReprs } from '@reprman/state/reprs/reprs.selectors'
import { Reprs, ToastLevel } from '@reprman/types'
import { all, call, delay, put, select, takeLatest } from 'redux-saga/effects'
import { clearCategories } from '@reprman/state/categories'
import { callConfirmation } from '@reprman/modals/Confirmation'
import { makeToastSAC } from '@reprman/state/sagas/toast/toast.actions'
import { CLEAR_ALL_REPRS } from '../reprs.actions'

export function* clearAllReprsWorker() {
  const t = LocalizationModule.getInstance().t.bind(
    LocalizationModule.getInstance()
  )

  // @ts-ignore
  const isFirstResponseAffirmative = yield call(callConfirmation, {
    title: t('confirmations.clearAllReprs.title'),
    body: t('confirmations.clearAllReprs.body'),
  })

  if (!isFirstResponseAffirmative) {
    return
  }

  yield delay(500)

  // @ts-ignore
  const isSecondResponseAffirmative = yield call(callConfirmation, {
    title: t('confirmations.clearAllReprs.titleLastChance'),
    body: t('confirmations.clearAllReprs.bodyLastChance'),
  })

  if (isSecondResponseAffirmative) {
    yield call(clearThemAll)
  }
}

export default [takeLatest(CLEAR_ALL_REPRS, clearAllReprsWorker)]

export function* clearThemAll() {
  const reprsApi = ReprsApiModule.getInstance()
  const currentReprs = (yield select(selectReprs)) as Reprs
  try {
    if (isReprsApiConfigured) {
      const batchSize = 10
      for (let i = 0; i < currentReprs.length; i += batchSize) {
        const batch = currentReprs.slice(i, i + batchSize)
        yield all(
          batch.map((repr) => call([reprsApi, reprsApi.removeRepr], repr.id))
        )
      }
    }
    yield put(clearAllReprs())
    yield put(clearCategories())
  } catch {
    yield put(
      makeToastSAC({
        body: LocalizationModule.getInstance().t(
          'errors.couldNotClearAllReprs'
        ),
        level: ToastLevel.FAIL,
        delay: 6000,
      })
    )
  }
}
