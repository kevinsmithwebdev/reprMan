import type { ComponentType } from 'react'
import BootstrapModal from 'react-bootstrap/Modal'
import BootstrapModalBody from 'react-bootstrap/ModalBody'
import BootstrapModalFooter from 'react-bootstrap/ModalFooter'
import BootstrapModalHeader from 'react-bootstrap/ModalHeader'
import BootstrapModalTitle from 'react-bootstrap/ModalTitle'

const resolveComponent = <T>(
  component: T
): ComponentType<Record<string, unknown>> => {
  const candidate =
    component !== null &&
    typeof component === 'object' &&
    'default' in (component as object) &&
    (component as { default?: T }).default !== undefined
      ? (component as unknown as { default: T }).default
      : component

  if (
    typeof candidate === 'function' ||
    (typeof candidate === 'object' &&
      candidate !== null &&
      '$$typeof' in (candidate as object))
  ) {
    return candidate as ComponentType<Record<string, unknown>>
  }

  throw new Error('react-bootstrap modal component failed to resolve')
}

export const Modal = resolveComponent(BootstrapModal)
export const ModalBody = resolveComponent(BootstrapModalBody)
export const ModalFooter = resolveComponent(BootstrapModalFooter)
export const ModalHeader = resolveComponent(BootstrapModalHeader)
export const ModalTitle = resolveComponent(BootstrapModalTitle)
