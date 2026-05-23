import { all, put, takeLatest } from 'redux-saga/effects'
import { ReprsApiModule, isReprsApiConfigured } from '@reprman/reprs-api'
import {
  resetMaxReprsQuota,
  setMaxReprsQuota,
  setTermsConfig,
} from '@reprman/state/reprsQuota'
import { setSettingsAC } from '@reprman/state/settings/settings.actions'
import { Reprs } from '@reprman/types'
import { LOAD_REPRS, storeReprsSAC } from '../reprs.actions'

function* loadReprsWorker() {
  if (!isReprsApiConfigured) {
    yield put(resetMaxReprsQuota())
    yield put(storeReprsSAC([] as Reprs))
    return
  }
  try {
    const reprsApi = ReprsApiModule.getInstance()
    const [cloudReprs, userConfig] = yield all([
      reprsApi.listReprs(),
      reprsApi.getUserConfig(),
    ])
    const {
      maxReprsAllowed,
      termsAcceptedAt,
      termsVersion,
      currentTermsVersion,
      practiceDelay,
      warningRatio,
    } = userConfig
    yield put(setSettingsAC({ practiceDelay, warningRatio }))
    yield put(setMaxReprsQuota(maxReprsAllowed))
    yield put(
      setTermsConfig({
        termsAcceptedAt: termsAcceptedAt ?? null,
        termsVersion: termsVersion ?? null,
        currentTermsVersion: currentTermsVersion ?? null,
      })
    )
    yield put(storeReprsSAC(cloudReprs as Reprs))
  } catch {
    yield put(resetMaxReprsQuota())
    yield put(storeReprsSAC([] as Reprs))
  }
}

export default [takeLatest(LOAD_REPRS, loadReprsWorker)]
