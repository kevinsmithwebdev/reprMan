import { ModalSelection } from '@reprman/modals/ModalContainer/ModalContainer.types'
import type { Repr } from '@reprman/types'
import type { PreloadedState } from '@reduxjs/toolkit'

import type { TestRootState } from './createTestStore'

export const testRepr = (overrides: Partial<Repr> = {}): Repr => ({
  id: 'repr-1',
  title: 'Test repr',
  categories: ['music'],
  dateCreated: 1_000,
  datesPracticed: [2_000],
  comment: 'A comment',
  learning: false,
  ...overrides,
})

export const loadedAppState = (
  reprs: Repr[] = []
): PreloadedState<TestRootState> => ({
  reprs,
  settings: { practiceDelay: 30, warningRatio: 0.5 },
  categories: {
    categories: ['music'],
    filter: { text: '', categories: [] },
  },
})

export const withModal = (
  selection: ModalSelection,
  props: Record<string, unknown> = {},
  base: PreloadedState<TestRootState> = loadedAppState()
): PreloadedState<TestRootState> => ({
  ...base,
  modal: { selection, props },
})
