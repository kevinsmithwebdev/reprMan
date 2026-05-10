/* eslint-disable react/jsx-props-no-spreading */
import React from 'react'
import EditRepr, { EditReprProps } from '@reprman/modals/EditRepr'
import Confirmation, { ConfirmationProps } from '@reprman/modals/Confirmation'
import { clearModal, useModal } from '@reprman/state/modal'
import { Modal } from 'react-bootstrap'
import store from '@reprman/state/store'
import Query, { QueryProps } from '@reprman/modals/Query'
import Info, { InfoProps } from '@reprman/modals/Info/Info'
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
      aria-labelledby="contained-modal-title-vcenter"
      centered
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

      {selection === ModalSelection.QUERY && (
        <Query {...(props as QueryProps)} closeModal={closeModal} />
      )}

      {selection === ModalSelection.INFO && <Info {...(props as InfoProps)} />}
    </Modal>
  )
}

export default ModalContainer
