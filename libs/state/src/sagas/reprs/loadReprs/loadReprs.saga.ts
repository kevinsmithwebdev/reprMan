import { call, delay, put, takeLatest } from 'redux-saga/effects'
import { ReprsApiModule, isReprsApiConfigured } from '@reprman/reprs-api'
import {
  setMaxReprsQuota,
  setSubscription,
  setTermsConfig,
} from '@reprman/state/reprsQuota'
import { setSettingsAC } from '@reprman/state/settings/settings.actions'
import { Reprs } from '@reprman/types'
import { LOAD_REPRS, storeReprsSAC } from '../reprs.actions'

const USER_CONFIG_MAX_ATTEMPTS = 3

export function* loadReprsWorker() {
  if (!isReprsApiConfigured) {
    yield put(setMaxReprsQuota(null))
    yield put(storeReprsSAC([] as Reprs))
    return
  }
  const reprsApi = ReprsApiModule.getInstance()

  try {
    const cloudReprs = yield call([reprsApi, reprsApi.listReprs])
    yield put(storeReprsSAC(cloudReprs as Reprs))
  } catch {
    yield put(storeReprsSAC([] as Reprs))
  }

  let userConfigLoaded = false
  for (let attempt = 0; attempt < USER_CONFIG_MAX_ATTEMPTS; attempt += 1) {
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
      userConfigLoaded = true
      break
    } catch {
      if (attempt < USER_CONFIG_MAX_ATTEMPTS - 1) {
        yield delay(1000 * (attempt + 1))
      }
    }
  }
  if (!userConfigLoaded) {
    // Mirror unlimited quota fallback so the UI is not stuck on "Loading…".
    yield put(setMaxReprsQuota(null))
    yield put(
      setSubscription({
        status: 'unlimited',
        expiration: null,
        maxReprs: null,
      })
    )
  }
}

export default [takeLatest(LOAD_REPRS, loadReprsWorker)]
