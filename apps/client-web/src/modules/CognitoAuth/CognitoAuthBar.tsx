import React, { useState } from 'react'
import { AuthError, deleteUser, signOut } from 'aws-amplify/auth'
import { Button, Dropdown, Modal, Spinner } from 'react-bootstrap'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useL10n } from 'modules/Localization'
import { isCognitoConfigured } from 'config/configureAmplify'
import { clearAllCategoryData } from 'state/categories'
import { resetReprs } from 'state/reprs'
import { resetSettingsAC } from 'state/settings/settings.actions'
import { clearUser } from 'state/user/user.actions'
import { useUser } from 'state/user/user.hooks'
import { makeToastSAC } from 'state/sagas/toast/toast.actions'
import { ToastLevel } from 'types'
import { useCognitoAuth } from './CognitoAuthContext'
import './CognitoAuthBar.css'
import { getUserInitials } from './getUserInitials'

const CognitoAuthBar = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { t } = useL10n()
  const { user } = useUser()
  const { sessionChecked, signedIn } = useCognitoAuth()
  const [busySignOut, setBusySignOut] = useState(false)
  const [busyDeleteAccount, setBusyDeleteAccount] = useState(false)
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false)

  const notifyAuthError = (err: unknown) => {
    const message =
      err instanceof AuthError ? err.message : t('auth.signInUnexpectedError')
    dispatch(
      makeToastSAC({
        body: message,
        level: ToastLevel.FAIL,
        delay: 6000,
      })
    )
  }

  const handleSignOut = async () => {
    setBusySignOut(true)
    try {
      await signOut()
      dispatch(clearUser())
      dispatch(resetReprs())
      dispatch(clearAllCategoryData())
      dispatch(resetSettingsAC())
    } catch (err) {
      notifyAuthError(err)
    } finally {
      setBusySignOut(false)
    }
  }

  const handleDeleteAccount = async () => {
    setBusyDeleteAccount(true)
    try {
      await deleteUser()
      dispatch(clearUser())
      dispatch(resetReprs())
      dispatch(clearAllCategoryData())
      dispatch(resetSettingsAC())
      dispatch(
        makeToastSAC({
          body: t('auth.deleteAccountSuccess'),
          level: ToastLevel.SUCCESS,
          delay: 6000,
        })
      )
      setShowDeleteAccountModal(false)
      navigate('/')
    } catch (err) {
      const message =
        err instanceof AuthError
          ? err.message
          : t('auth.deleteAccountUnexpectedError')
      dispatch(
        makeToastSAC({
          body: message,
          level: ToastLevel.FAIL,
          delay: 6000,
        })
      )
    } finally {
      setBusyDeleteAccount(false)
    }
  }

  if (!isCognitoConfigured) {
    return null
  }

  if (!sessionChecked) {
    return (
      <div
        className="d-flex align-items-center text-white px-2"
        style={{ minHeight: 38 }}
      >
        <Spinner animation="border" size="sm" role="status" />
      </div>
    )
  }

  const initials = signedIn ? getUserInitials(user) : ''

  return (
    <div className="d-flex align-items-center gap-2 flex-wrap justify-content-end text-white px-2 ms-auto">
      {signedIn ? (
        <Dropdown align="end">
          <Dropdown.Toggle
            variant="link"
            bsPrefix="btn"
            className="cognito-avatar-dropdown-toggle text-decoration-none text-white p-1 d-flex align-items-center"
            id="cognito-user-avatar-toggle"
            aria-label={t('auth.userAvatarMenuLabel')}
          >
            <span
              className="cognito-user-avatar rounded-circle bg-success d-inline-flex align-items-center justify-content-center text-white fw-semibold user-select-none"
              aria-hidden
            >
              {initials}
            </span>
          </Dropdown.Toggle>
          <Dropdown.Menu
            className="cognito-user-dropdown-menu"
            popperConfig={{ strategy: 'fixed' }}
          >
            <Dropdown.ItemText className="text-wrap text-break">
              <div className="small text-muted text-uppercase mb-1">
                {t('auth.userMenuCurrentUser')}
              </div>
              <div className="fw-medium text-body">{user.email}</div>
              {user.name && user.name !== user.email ? (
                <div className="small text-muted mt-1">{user.name}</div>
              ) : null}
            </Dropdown.ItemText>
            <Dropdown.Divider />
            <Dropdown.Item
              as="button"
              type="button"
              onClick={() => navigate('/change-password')}
              id="cognito-change-password"
            >
              {t('auth.changePasswordMenu')}
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item
              as="button"
              type="button"
              disabled={busySignOut}
              onClick={() => handleSignOut()}
              id="cognito-sign-out"
            >
              {busySignOut ? (
                <Spinner
                  animation="border"
                  size="sm"
                  className="me-2"
                  role="status"
                />
              ) : null}
              {t('auth.signOut')}
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item
              as="button"
              type="button"
              className="text-danger fw-semibold"
              disabled={busyDeleteAccount}
              onClick={() => setShowDeleteAccountModal(true)}
              id="cognito-delete-account"
            >
              {t('auth.deleteAccount')}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      ) : (
        <Button
          variant="outline-light"
          size="sm"
          disabled={busySignOut}
          onClick={() => navigate('/signin')}
          id="cognito-sign-in-open"
        >
          {t('auth.signInButton')}
        </Button>
      )}
      <Modal
        show={showDeleteAccountModal}
        onHide={() => setShowDeleteAccountModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{t('auth.deleteAccount')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <strong>Warning</strong>: {t('auth.deleteAccountWarningLead')}{' '}
          <strong>lost</strong> {t('auth.deleteAccountWarningMiddle')}{' '}
          <strong>deleted</strong>. {t('auth.deleteAccountWarningTail')}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            disabled={busyDeleteAccount}
            onClick={() => setShowDeleteAccountModal(false)}
          >
            {t('auth.cancel')}
          </Button>
          <Button
            variant="danger"
            disabled={busyDeleteAccount}
            onClick={handleDeleteAccount}
          >
            {busyDeleteAccount ? (
              <Spinner
                animation="border"
                size="sm"
                className="me-2"
                role="status"
              />
            ) : null}
            {t('auth.deleteAccount')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default CognitoAuthBar
