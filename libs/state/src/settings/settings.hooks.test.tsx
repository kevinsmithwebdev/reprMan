import { describe, expect, it } from 'vitest'
import { Provider } from 'react-redux'
import { renderHook } from '@testing-library/react'

import { createTestStore } from '../../../../apps/client-web/src/test-utils/createTestStore'
import { useSettings } from './settings.hooks'

const wrapper =
  (store: ReturnType<typeof createTestStore>) =>
  ({ children }: { children: React.ReactNode }) =>
    <Provider store={store}>{children}</Provider>

describe('useSettings', () => {
  it('reads settings from the store', () => {
    const settings = { practiceDelay: 4, warningRatio: 0.3 }
    const store = createTestStore({ settings })
    const { result } = renderHook(() => useSettings(), {
      wrapper: wrapper(store),
    })

    expect(result.current.settings).toEqual(settings)
  })
})
