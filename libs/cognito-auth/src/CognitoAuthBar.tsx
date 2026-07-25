import React, { useEffect, useState } from 'react'
import { AuthError, deleteUser } from 'aws-amplify/auth'
import { Button, Dropdown, Modal, Spinner } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { useL10n } from '@reprman/localization'
import { isCognitoConfigured } from '@reprman/cognito-auth/configureAmplify'
import { isReprsApiConfigured } from '@reprman/reprs-api'
import { clearAllCategoryData } from '@reprman/state/categories'
import { resetReprs } from '@reprman/state/reprs'
import {
  selectSubscription,
  selectSubscriptionLoaded,
} from '@reprman/state/reprsQuota'
import { resetSettingsAC } from '@reprman/state/settings/settings.actions'
import { clearUser } from '@reprman/state/user/user.actions'
import { useUser } from '@reprman/state/user/user.hooks'
import { makeToastSAC } from '@reprman/state/sagas/toast/toast.actions'
import { loadReprsSAC } from '@reprman/state/sagas/reprs/reprs.actions'
import { ToastLevel } from '@reprman/types'
import { useCognitoAuth } from './CognitoAuthContext'
import { useCognitoSignOut } from './useCognitoSignOut'
import './CognitoAuthBar.css'
import { getUserInitials } from './getUserInitials'

const CognitoAuthBar = () => {
  const dispatch = useDispatch()
  const router = useRouter()
  const { t } = useL10n()
  const { user } = useUser()
  const subscription = useSelector(selectSubscription)
  const subscriptionLoaded = useSelector(selectSubscriptionLoaded)
  const { sessionChecked, signedIn } = useCognitoAuth()
  const { busy: busySignOut, handleSignOut } = useCognitoSignOut()
  const [busyDeleteAccount, setBusyDeleteAccount] = useState(false)
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false)

  useEffect(() => {
    if (
      sessionChecked &&
      signedIn &&
      isReprsApiConfigured &&
      !subscriptionLoaded
    ) {
      dispatch(loadReprsSAC())
    }
  }, [dispatch, sessionChecked, signedIn, subscriptionLoaded])

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
      router.replace('/')
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

  if (!isCognitoConfigured()) {
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
    <div className="d-flex align-items-center gap-2 flex-wrap justify-content-end text-white px-2">
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
            <Dropdown.ItemText
              className="text-wrap text-break"
              id="cognito-user-subscription"
            >
              <div className="small text-muted text-uppercase mb-1">
                {t('billing.subscriptionLabel')}
              </div>
              <div className="fw-medium text-body">
                {subscriptionLoaded && subscription
                  ? t(`billing.status.${subscription.status}`)
                  : t('billing.subscriptionLoading')}
              </div>
            </Dropdown.ItemText>
            <Dropdown.Divider />
            <Dropdown.Item
              as="button"
              type="button"
              onClick={() => router.push('/terms')}
              id="cognito-terms-of-use"
            >
              {t('auth.termsOfUseMenu')}
            </Dropdown.Item>
            <Dropdown.Item
              as="button"
              type="button"
              onClick={() => router.push('/change-password')}
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
          onClick={() => router.push('/signin')}
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
          <strong>{t('common.warning')}</strong>:{' '}
          {t('auth.deleteAccountWarningLead')}{' '}
          <strong>{t('auth.deleteAccountWarningLost')}</strong>{' '}
          {t('auth.deleteAccountWarningMiddle')}{' '}
          <strong>{t('auth.deleteAccountWarningDeleted')}</strong>.{' '}
          {t('auth.deleteAccountWarningTail')}
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
