import LocalizationModule from '@reprman/localization/Localization.module'
import { put, select, takeLatest } from 'redux-saga/effects'
import moment from 'moment'
import { v4 as uuidv4 } from 'uuid'
import {
  ReprsApiModule,
  isReprsApiConfigured,
  toUserFriendlyApiErrorMessage,
} from '@reprman/reprs-api'
import { selectReprs, setReprs } from '@reprman/state/reprs'
import { Categories, Reprs, ToastLevel } from '@reprman/types'
import { selectCategories, setCategories } from '@reprman/state/categories'
import { makeToastSAC } from '@reprman/state/sagas/toast/toast.actions'
import { ADD_REPR } from '../reprs.actions'
import { mergeCategories } from '../../reprs.helpers'

export function* addReprWorker({ payload: repr }: any) {
  const reprsApi = ReprsApiModule.getInstance()

  const currentReprs = (yield select(selectReprs)) as Reprs

  let newReprs = [] as Reprs

  if (repr.id) {
    // existing repr
    const index = currentReprs.findIndex((r) => r.id === repr.id)

    if (index === -1) return

    newReprs = [...currentReprs]
    newReprs[index] = repr
  } else {
    // new repr
    const newRepr = {
      ...repr,
      id: uuidv4(),
      dateCreated: moment.utc().valueOf(),
    }
    newReprs = [newRepr, ...currentReprs]
  }

  yield put(setReprs(newReprs))
  try {
    if (isReprsApiConfigured) {
      const targetRepr = repr.id ? repr : newReprs[0]
      yield reprsApi.upsertRepr(targetRepr)
    }
  } catch (error: unknown) {
    yield put(setReprs(currentReprs))
    yield put(
      makeToastSAC({
        body: toUserFriendlyApiErrorMessage(
          error,
          LocalizationModule.getInstance().t('errors.couldNotSaveReprChanges')
        ),
        level: ToastLevel.FAIL,
        delay: 6000,
      })
    )
    return
  }

  const currentCategories = (yield select(selectCategories)) as Categories
  const mergedCategories =
    repr.categories.length === 0
      ? currentCategories
      : mergeCategories(currentCategories, repr.categories)
  yield put(setCategories(mergedCategories))
}

export default [takeLatest(ADD_REPR, addReprWorker)]
