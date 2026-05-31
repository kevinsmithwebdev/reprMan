import { call, put, takeLatest } from 'redux-saga/effects'
import { ReprsApiModule, isReprsApiConfigured } from '@reprman/reprs-api'
import {
  resetMaxReprsQuota,
  setMaxReprsQuota,
  setSubscription,
  setTermsConfig,
} from '@reprman/state/reprsQuota'
import { setSettingsAC } from '@reprman/state/settings/settings.actions'
import { Reprs } from '@reprman/types'
import { LOAD_REPRS, storeReprsSAC } from '../reprs.actions'

export function* loadReprsWorker() {
  if (!isReprsApiConfigured) {
    yield put(resetMaxReprsQuota())
    yield put(storeReprsSAC([] as Reprs))
    return
  }
  const reprsApi = ReprsApiModule.getInstance()
  try {
    const userConfig = yield call([reprsApi, reprsApi.getUserConfig])
    const {
      subscription,
      maxReprsAllowed,
      termsAcceptedAt,
      termsVersion,
      currentTermsVersion,
      practiceDelay,
      warningRatio,
    } = userConfig
    yield put(setSettingsAC({ practiceDelay, warningRatio }))
    yield put(setSubscription(subscription))
    yield put(setMaxReprsQuota(maxReprsAllowed))
    yield put(
      setTermsConfig({
        termsAcceptedAt: termsAcceptedAt ?? null,
        termsVersion: termsVersion ?? null,
        currentTermsVersion: currentTermsVersion ?? null,
      })
    )
  } catch {
    yield put(resetMaxReprsQuota())
  }
  try {
    const cloudReprs = yield call([reprsApi, reprsApi.listReprs])
    yield put(storeReprsSAC(cloudReprs as Reprs))
  } catch {
    yield put(storeReprsSAC([] as Reprs))
  }
}

export default [takeLatest(LOAD_REPRS, loadReprsWorker)]
