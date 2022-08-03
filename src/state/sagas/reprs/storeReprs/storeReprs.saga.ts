import { put, takeLatest } from 'redux-saga/effects'
import { setReprs } from 'state/reprs'
import { Repr, Reprs } from 'types'
import { v4 as uuidv4 } from 'uuid'
import moment from 'moment'
import { LocalStorageModule } from 'modules'
import { setCategories } from 'state/categories'
import { STORE_REPRS } from '../reprs.actions'
import { getAllCategories } from '../../reprs.helpers'

function* storeReprsWorker({ payload: rawReprs }: any) {
  const cleanReprs = _getCleanReprs(rawReprs)

  yield put(setReprs(cleanReprs))
  LocalStorageModule.getInstance().setReprs(cleanReprs as Reprs)

  const categories = getAllCategories(cleanReprs)
  yield put(setCategories(categories))
}

export default [takeLatest(STORE_REPRS, storeReprsWorker)]

const _getCleanReprs = (rawReprs: Reprs): Reprs =>
  [...rawReprs]
    .map((repr: Repr) => {
      const datesPracticed = [...repr.datesPracticed]
      datesPracticed.sort((a, b) => b - a)
      return {
        ...repr,
        datesPracticed,
        id: repr.id || uuidv4(),
        dateCreated: repr.dateCreated || moment().utc().valueOf(),
      }
    })
    .sort(
      (a: Repr, b: Repr) =>
        (a.datesPracticed[0] || 0) - (b.datesPracticed[0] || 0)
    )
