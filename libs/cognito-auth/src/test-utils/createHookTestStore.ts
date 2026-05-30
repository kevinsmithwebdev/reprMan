import type { PreloadedState } from '@reduxjs/toolkit'
import { addToastAC } from '@reprman/state/toasts/toasts.actions'
import { MAKE_TOAST } from '@reprman/state/sagas/toast/toast.actions'
import {
  createTestStore,
  type TestRootState,
  type TestStore,
} from '@client-web/test-utils/createTestStore'
import type { ToastRequest } from '@reprman/types'

let toastCounter = 0

/** Test store that applies `makeToastSAC` payloads to the toasts slice (no saga). */
export function createHookTestStore(
  preloadedState?: PreloadedState<TestRootState>
): TestStore {
  const store = createTestStore(preloadedState)
  const baseDispatch = store.dispatch.bind(store)

  store.dispatch = ((action: { type?: string; payload?: ToastRequest }) => {
    if (action?.type === MAKE_TOAST && action.payload) {
      toastCounter += 1
      return baseDispatch(
        addToastAC({
          ...action.payload,
          id: `toast-${toastCounter}`,
        })
      )
    }
    return baseDispatch(action as never)
  }) as typeof store.dispatch

  return store
}

export function resetHookTestStoreToasts() {
  toastCounter = 0
}
