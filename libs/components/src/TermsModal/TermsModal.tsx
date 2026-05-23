import { useL10n } from '@reprman/localization'
import React, { FC } from 'react'
import { Button, Modal } from 'react-bootstrap'
import TermsContent from '../TermsContent'

interface TermsModalProps {
  show: boolean
  onHide: () => void
}

const TermsModal: FC<TermsModalProps> = ({ show, onHide }) => {
  const { t } = useL10n()
  return (
    <Modal show={show} onHide={onHide} size="lg" scrollable centered>
      <Modal.Header closeButton>
        <Modal.Title>{t('pages.terms.title')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <TermsContent />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={onHide}>
          {t('buttons.back')}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default TermsModal
