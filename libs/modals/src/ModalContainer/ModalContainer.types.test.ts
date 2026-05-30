import { describe, expect, it } from 'vitest'
import {
  ConfirmationModalResponse,
  ModalSelection,
  QueryModalType,
} from './ModalContainer.types'

describe('ModalContainer.types', () => {
  it('exports modal enums and constants', () => {
    expect(ModalSelection.CONFIRMATION).toBe('CONFIRMATION')
    expect(ConfirmationModalResponse.YES).toBe('MODAL/CONFIRMATION_YES')
    expect(QueryModalType).toBe('MODAL/QUERY')
  })
})
