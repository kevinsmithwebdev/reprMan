import React, { FC } from 'react'
import { ConfirmationModalResponse } from 'modals/ModalContainer/ModalContainer.types'
import { Button, Modal } from 'react-bootstrap'
import store from 'state/store'

export interface ConfirmationProps {
  closeModal: () => void
  title: string
  body: string
}

const Confirmation: FC<ConfirmationProps> = ({ closeModal, title, body }) => {
  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{body}</Modal.Body>
      <Modal.Footer>
        <Button
          style={{ flex: 1 }}
          variant="success"
          onClick={() => {
            store.dispatch({ type: ConfirmationModalResponse.YES })
            closeModal()
          }}
        >
          Yes
        </Button>
        <Button
          style={{ flex: 1 }}
          variant="danger"
          onClick={() => {
            store.dispatch({ type: ConfirmationModalResponse.NO })
            closeModal()
          }}
        >
          No
        </Button>
      </Modal.Footer>
    </>
  )
}

export default Confirmation
