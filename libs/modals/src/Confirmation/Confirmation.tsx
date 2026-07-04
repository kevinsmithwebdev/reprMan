import React, { FC } from 'react'
import { ConfirmationModalResponse } from '@reprman/modals/ModalContainer/ModalContainer.types'
import { useDispatch } from 'react-redux'
import { Button, Modal } from 'react-bootstrap'
import { useL10n } from '@reprman/localization'

export interface ConfirmationProps {
  closeModal: () => void
  title: string
  body: string
}

const Confirmation: FC<ConfirmationProps> = ({ closeModal, title, body }) => {
  const dispatch = useDispatch()
  const { t } = useL10n()
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
            dispatch({ type: ConfirmationModalResponse.YES })
            closeModal()
          }}
        >
          {t('common.yes')}
        </Button>
        <Button
          style={{ flex: 1 }}
          variant="danger"
          onClick={() => {
            dispatch({ type: ConfirmationModalResponse.NO })
            closeModal()
          }}
        >
          {t('common.no')}
        </Button>
      </Modal.Footer>
    </>
  )
}

export default Confirmation
