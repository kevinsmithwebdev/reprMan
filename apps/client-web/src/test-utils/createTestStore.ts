import {
  combineReducers,
  configureStore,
  type PreloadedState,
} from '@reduxjs/toolkit'
import categoriesReducer from '@reprman/state/categories'
import modalReducer from '@reprman/state/modal'
import reprsReducer from '@reprman/state/reprs'
import reprsQuotaReducer from '@reprman/state/reprsQuota'
import settingsReducer from '@reprman/state/settings'
import toastsReducer from '@reprman/state/toasts'
import userReducer from '@reprman/state/user'

const rootReducer = combineReducers({
  categories: categoriesReducer,
  modal: modalReducer,
  reprs: reprsReducer,
  reprsQuota: reprsQuotaReducer,
  settings: settingsReducer,
  toasts: toastsReducer,
  user: userReducer,
})

export type TestRootState = ReturnType<typeof rootReducer>

/**
 * Redux store for tests: same reducers as production, no saga middleware.
 */
export function createTestStore(
  preloadedState?: PreloadedState<TestRootState>
) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }),
  })
}

export type TestStore = ReturnType<typeof createTestStore>
