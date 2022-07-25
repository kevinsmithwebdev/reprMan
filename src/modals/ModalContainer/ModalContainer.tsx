/* eslint-disable react/jsx-props-no-spreading */
import React from 'react'
import EditRepr, { EditReprProps } from 'modals/EditRepr'
import Confirmation, { ConfirmationProps } from 'modals/Confirmation'
import { clearModal, useModal } from 'state/modal'
import { Modal } from 'react-bootstrap'
import store from 'state/store'
import { ModalSelection } from './ModalContainer.types'

const ModalContainer = () => {
  const { selection, props } = useModal()
  const closeModal = () => store.dispatch(clearModal())
  return (
    <Modal
      show={!!selection}
      onHide={closeModal}
      backdrop="static"
      keyboard={false}
    >
      {selection === ModalSelection.EDIT_REPR && (
        <EditRepr {...(props as EditReprProps)} closeModal={closeModal} />
      )}

      {selection === ModalSelection.CONFIRMATION && (
        <Confirmation
          {...(props as ConfirmationProps)}
          closeModal={closeModal}
        />
      )}
    </Modal>
  )
}

export default ModalContainer
