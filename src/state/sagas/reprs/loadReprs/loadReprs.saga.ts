import { put, takeLatest } from 'redux-saga/effects'
import { LocalStorageModule } from 'modules'
import { setReprs } from 'state/reprs'
import { Reprs, Repr } from 'types'
import { getAllCategories } from 'state/sagas/reprs.helpers'
import { setCategories } from 'state/categories'
import { LOAD_REPRS } from '../reprs.actions'

function* loadReprsWorker() {
  const localStorage = LocalStorageModule.getInstance()

  // eslint-disable-next-line global-require
  // const rawReprs = require('../../../reprs/__FIXTURES__/generatedReprs.json') as Reprs
  const rawReprs = (yield localStorage.getReprs()) as Reprs

  const cleanReprs = _getCleanReprs(rawReprs)

  yield put(setReprs(cleanReprs))

  const categories = getAllCategories(cleanReprs)
  yield put(setCategories(categories))
}

export default [takeLatest(LOAD_REPRS, loadReprsWorker)]

const _getCleanReprs = (rawReprs: Reprs): Reprs =>
  [...rawReprs]
    .map((repr: Repr) => {
      const datesPracticed = [...repr.datesPracticed]
      datesPracticed.sort((a, b) => b - a)
      return {
        ...repr,
        datesPracticed,
      }
    })
    .sort(
      (a: Repr, b: Repr) =>
        (a.datesPracticed[0] || 0) - (b.datesPracticed[0] || 0)
    )
