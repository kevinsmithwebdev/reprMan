import { CognitoAuthProvider } from '@reprman/cognito-auth'
import type { PreloadedState } from '@reduxjs/toolkit'
import { render, type RenderOptions } from '@testing-library/react'
import React, { type ReactElement } from 'react'
import { Provider } from 'react-redux'
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom'

import {
  createTestStore,
  type TestRootState,
  type TestStore,
} from './createTestStore'

export type RenderWithAppShellOptions = Omit<RenderOptions, 'wrapper'> & {
  /** Redux preloaded state (mirrors app `RootState` slice keys). */
  preloadedState?: PreloadedState<TestRootState>
  /** Use an existing store (e.g. when mocking `@reprman/state/store`). */
  store?: TestStore
  /** `initialEntries` for `MemoryRouter` (default `['/']`). */
  initialEntries?: MemoryRouterProps['initialEntries']
  /** `initialIndex` for `MemoryRouter` (default `0`). */
  initialIndex?: MemoryRouterProps['initialIndex']
}

export type RenderWithAppShellResult = ReturnType<typeof render> & {
  store: TestStore
}

/**
 * Renders UI with the same outer providers as the app shell: Redux, memory
 * router, and Cognito auth context (no `configureAmplify` side effects).
 */
export function renderWithAppShell(
  ui: ReactElement,
  {
    preloadedState,
    store: storeOption,
    initialEntries = ['/'],
    initialIndex = 0,
    ...renderOptions
  }: RenderWithAppShellOptions = {}
): RenderWithAppShellResult {
  const store = storeOption ?? createTestStore(preloadedState)

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      <MemoryRouter initialEntries={initialEntries} initialIndex={initialIndex}>
        <CognitoAuthProvider>{children}</CognitoAuthProvider>
      </MemoryRouter>
    </Provider>
  )

  const result = render(ui, { wrapper: Wrapper, ...renderOptions })
  return { ...result, store }
}
