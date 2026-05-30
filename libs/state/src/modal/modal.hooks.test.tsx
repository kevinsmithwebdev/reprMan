import { describe, expect, it } from 'vitest'
import { Provider } from 'react-redux'
import { renderHook } from '@testing-library/react'
import { ModalSelection } from '@reprman/modals/ModalContainer/ModalContainer.types'

import { createTestStore } from '../../../../apps/client-web/src/test-utils/createTestStore'
import { useModal } from './modal.hooks'

const wrapper =
  (store: ReturnType<typeof createTestStore>) =>
  ({ children }: { children: React.ReactNode }) =>
    <Provider store={store}>{children}</Provider>

describe('useModal', () => {
  it('reads modal state from the store', () => {
    const store = createTestStore({
      modal: {
        selection: ModalSelection.INFO,
        props: { title: 'Hi' } as Object,
      },
    })
    const { result } = renderHook(() => useModal(), {
      wrapper: wrapper(store),
    })

    expect(result.current).toEqual({
      selection: ModalSelection.INFO,
      props: { title: 'Hi' },
    })
  })
})
