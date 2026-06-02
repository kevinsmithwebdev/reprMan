import React, { useState } from 'react'
import { TERMS_VERSION } from '@reprman/constants'
import { useCognitoAuth } from '@reprman/cognito-auth/CognitoAuthContext'
import { isReprsApiConfigured, ReprsApiModule } from '@reprman/reprs-api'
import { useL10n } from '@reprman/localization'
import { Button, Form, Modal, Spinner } from 'react-bootstrap'
import { useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  selectNeedsTermsAcceptance,
  selectTermsConfigLoaded,
  setTermsConfig,
} from '@reprman/state/reprsQuota'
import { makeToastSAC } from '@reprman/state/sagas/toast/toast.actions'
import { ToastLevel } from '@reprman/types'
import TermsLink from '../TermsLink'

const SKIP_PATH_PREFIXES = ['/terms', '/signup', '/signin']

const AcceptTermsGate = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const { t } = useL10n()
  const { signedIn, sessionChecked } = useCognitoAuth()
  const needsAcceptance = useSelector(selectNeedsTermsAcceptance)
  const termsConfigLoaded = useSelector(selectTermsConfigLoaded)
  const [accepted, setAccepted] = useState(false)
  const [busy, setBusy] = useState(false)

  const skipPath = SKIP_PATH_PREFIXES.some((prefix) =>
    location.pathname.startsWith(prefix)
  )

  const show =
    isReprsApiConfigured &&
    sessionChecked &&
    signedIn &&
    termsConfigLoaded &&
    needsAcceptance &&
    !skipPath

  const handleAccept = async () => {
    if (!accepted) {
      return
    }
    setBusy(true)
    try {
      const result = await ReprsApiModule.getInstance().acceptTerms(TERMS_VERSION)
      dispatch(
        setTermsConfig({
          termsAcceptedAt: result.termsAcceptedAt,
          termsVersion: result.termsVersion,
          currentTermsVersion: result.currentTermsVersion,
        })
      )
      setAccepted(false)
    } catch {
      dispatch(
        makeToastSAC({
          body: t('auth.acceptTermsFailed'),
          level: ToastLevel.FAIL,
          delay: 8000,
        })
      )
    } finally {
      setBusy(false)
    }
  }

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
