import { all } from 'redux-saga/effects'
import { showPingSaga } from './ping'
import reprWorkers from './reprs'
import toastWorkers from './toast'

import { genesisSaga } from './genesis'

export default function* rootSaga() {
  yield all([...showPingSaga, ...reprWorkers, ...toastWorkers, ...genesisSaga])
}
