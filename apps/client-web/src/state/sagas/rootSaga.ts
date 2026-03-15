import { all } from 'redux-saga/effects'
import { showPingSaga } from './ping'
import reprWorkers from './reprs'
import settingsWorkers from './settings'
import filesWorkers from './files'
import toastWorkers from './toast'

import { genesisSaga } from './genesis'

export default function* rootSaga() {
  yield all([
    ...filesWorkers,
    ...showPingSaga,
    ...reprWorkers,
    ...settingsWorkers,
    ...toastWorkers,
    ...genesisSaga,
  ])
}
