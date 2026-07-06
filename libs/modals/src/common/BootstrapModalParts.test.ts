import { describe, expect, it } from 'vitest'

import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from './BootstrapModalParts'

describe('BootstrapModalParts', () => {
  it('resolves react-bootstrap modal components', () => {
    expect(Modal).toBeTruthy()
    expect(ModalBody).toBeTruthy()
    expect(ModalFooter).toBeTruthy()
    expect(ModalHeader).toBeTruthy()
    expect(ModalTitle).toBeTruthy()
  })
})
