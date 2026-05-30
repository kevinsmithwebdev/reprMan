import { delay, takeLatest } from 'redux-saga/effects'
import { SHOW_PING } from '../ping.actions'

export function* showPingWorker({ payload }: any) {
  yield delay(500)

  console.info('SAGA worker PONG!!!')
  console.info('This is the payload:', payload)
}

export default [takeLatest(SHOW_PING, showPingWorker)]
