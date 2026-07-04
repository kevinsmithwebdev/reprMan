import React, { useState } from 'react'
import { TERMS_VERSION } from '@reprman/constants'
import { useAcceptTermsGate } from '@reprman/cognito-auth'
import { useL10n } from '@reprman/localization'
import { Button, Form, Modal, Spinner } from 'react-bootstrap'
import { usePathname } from 'next/navigation'
import TermsLink from '../TermsLink'

const SKIP_PATH_PREFIXES = ['/terms', '/signup', '/signin']

const AcceptTermsGate = () => {
  const pathname = usePathname()
  const { t } = useL10n()
  const skipPath = SKIP_PATH_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  )
  const { show, accepted, setAccepted, busy, handleAccept } =
    useAcceptTermsGate({ skip: skipPath })

  return (
    <Modal show={show} backdrop="static" keyboard={false} centered>
      <Modal.Header>
        <Modal.Title>{t('auth.acceptTermsTitle')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{t('auth.acceptTermsIntro')}</p>
        <Form.Check
          type="checkbox"
          id="accept-terms-gate"
          checked={accepted}
          onChange={(ev) => setAccepted(ev.target.checked)}
          disabled={busy}
          label={
            <span>
              {t('auth.signUpTermsPrefix')} <TermsLink />
            </span>
          }
        />
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="primary"
          disabled={!accepted || busy}
          onClick={() => handleAccept()}
        >
          {busy ? (
            <Spinner animation="border" size="sm" className="me-1" />
          ) : null}
          {t('auth.acceptTermsSubmit')}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default AcceptTermsGate
