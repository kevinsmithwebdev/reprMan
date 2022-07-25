import { all } from 'redux-saga/effects'
import { showPingSaga } from './ping'
import reprWorkers from './reprs'
import settingsWorkers from './settings'

import { genesisSaga } from './genesis'

export default function* rootSaga() {
  yield all([
    ...showPingSaga,
    ...reprWorkers,
    ...settingsWorkers,
    ...genesisSaga,
  ])
}
