import React, { FC } from 'react'
import { ConfirmationModalResponse } from '@reprman/modals/ModalContainer/ModalContainer.types'
import { useDispatch } from 'react-redux'
import { Button } from 'react-bootstrap'
import {
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '../common/BootstrapModalParts'
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
      <ModalHeader closeButton>
        <ModalTitle>{title}</ModalTitle>
      </ModalHeader>
      <ModalBody>{body}</ModalBody>
      <ModalFooter>
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
      </ModalFooter>
    </>
  )
}

export default Confirmation
