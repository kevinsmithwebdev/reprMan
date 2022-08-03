import LocalizationModule from 'modules/Localization/Localization.module'
import { put, delay, takeEvery } from 'redux-saga/effects'
import { addToastAC, removeToastAC } from 'state/toasts'
import { ToastLevel } from 'types'
import { v4 as uuidv4 } from 'uuid'
import { MAKE_TOAST } from '../toast.actions'

function* makeToastWorker({ payload: toastData }: any) {
  const id = uuidv4()
  const { t } = LocalizationModule.getInstance()
  const DEFAULT_TITLE_BY_LEVEL = {
    [ToastLevel.SUCCESS]: t('common.success').toUpperCase(),
    [ToastLevel.FAIL]: t('common.fail').toUpperCase(),
    [ToastLevel.INFO]: t('common.info').toUpperCase(),
    [ToastLevel.WARNING]: t('common.warning').toUpperCase(),
  }

  yield put(
    addToastAC({
      ...toastData,
      id,
      title:
        toastData.title ||
        DEFAULT_TITLE_BY_LEVEL[toastData.level as ToastLevel] ||
        '',
    })
  )

  if (toastData.delay) {
    yield delay(toastData.delay)
    yield put(removeToastAC(id))
  }
}

export default [takeEvery(MAKE_TOAST, makeToastWorker)]
