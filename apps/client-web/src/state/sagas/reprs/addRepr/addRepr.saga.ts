import { put, select, takeLatest } from 'redux-saga/effects'
import moment from 'moment'
import { v4 as uuidv4 } from 'uuid'
import { LocalStorageModule, ReprsApiModule } from 'modules'
import { isReprsApiConfigured } from 'modules/ReprsApi'
import { selectReprs, setReprs } from 'state/reprs'
import { Categories, Reprs } from 'types'
import { selectCategories, setCategories } from 'state/categories'
import { ADD_REPR } from '../reprs.actions'
import { mergeCategories } from '../../reprs.helpers'

function* addReprWorker({ payload: repr }: any) {
  const reprsApi = ReprsApiModule.getInstance()
  const localStorage = LocalStorageModule.getInstance()

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
  if (isReprsApiConfigured) {
    const targetRepr = repr.id ? repr : newReprs[0]
    yield reprsApi.upsertRepr(targetRepr)
  } else {
    yield localStorage.setReprs(newReprs)
  }

  const currentCategories = (yield select(selectCategories)) as Categories
  // TODO: more efficient way to merge?
  const mergedCategories = mergeCategories(currentCategories, repr.categories)
  yield put(setCategories(mergedCategories))
}

export default [takeLatest(ADD_REPR, addReprWorker)]
