import { CognitoAuthProvider } from '@reprman/cognito-auth'
import type { PreloadedState } from '@reduxjs/toolkit'
import { render, type RenderOptions } from '@testing-library/react'
import React, { type ReactElement } from 'react'
import { Provider } from 'react-redux'

import {
  createTestStore,
  type TestRootState,
  type TestStore,
} from './createTestStore'
import { setMockPathname } from './nextNavigationMock'

export type RenderWithAppShellOptions = Omit<RenderOptions, 'wrapper'> & {
  preloadedState?: PreloadedState<TestRootState>
  store?: TestStore
  /** Pathname for `usePathname()` (default `'/'`). */
  initialPathname?: string
}

export type RenderWithAppShellResult = ReturnType<typeof render> & {
  store: TestStore
}

export function renderWithAppShell(
  ui: ReactElement,
  {
    preloadedState,
    store: storeOption,
    initialPathname,
    ...renderOptions
  }: RenderWithAppShellOptions = {}
): RenderWithAppShellResult {
  const pathname = initialPathname ?? '/'
  setMockPathname(pathname)
  const store = storeOption ?? createTestStore(preloadedState)

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      <CognitoAuthProvider>{children}</CognitoAuthProvider>
    </Provider>
  )

  const result = render(ui, { wrapper: Wrapper, ...renderOptions })
  return { ...result, store }
}
