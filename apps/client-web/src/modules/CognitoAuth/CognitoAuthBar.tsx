import React, { useState } from 'react'
import { AuthError, signOut } from 'aws-amplify/auth'
import { Button, Dropdown, Spinner } from 'react-bootstrap'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useL10n } from 'modules/Localization'
import { isCognitoConfigured } from 'config/configureAmplify'
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
    } catch (err) {
      notifyAuthError(err)
    } finally {
      setBusySignOut(false)
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
          <Dropdown.Menu>
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
    </div>
  )
}

export default CognitoAuthBar
