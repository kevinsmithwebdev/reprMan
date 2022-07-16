import React, { FC } from 'react'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'

interface EditReprProps {
  closeModal: () => void
}

const EditRepr: FC<EditReprProps> = ({ closeModal }) => {
  return (
    <div>
      <Modal.Header closeButton>
        <Modal.Title>Modal title</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        I will not close if you click outside me. Do not even try to press
        escape key.
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={closeModal}>
          Close without Save
        </Button>
        <Button variant="success">Save</Button>
      </Modal.Footer>
    </div>
  )
}

export default EditRepr
