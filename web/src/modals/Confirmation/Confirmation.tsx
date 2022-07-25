import React, { FC } from 'react'
import { ConfirmationModalResponse } from 'modals/ModalContainer/ModalContainer.types'
import { Button, Modal } from 'react-bootstrap'
import store from 'state/store'
import { useL10n } from 'modules/Localization'

export interface ConfirmationProps {
  closeModal: () => void
  title: string
  body: string
}

const Confirmation: FC<ConfirmationProps> = ({ closeModal, title, body }) => {
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
            store.dispatch({ type: ConfirmationModalResponse.YES })
            closeModal()
          }}
        >
          {t('common.yes')}
        </Button>
        <Button
          style={{ flex: 1 }}
          variant="danger"
          onClick={() => {
            store.dispatch({ type: ConfirmationModalResponse.NO })
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
