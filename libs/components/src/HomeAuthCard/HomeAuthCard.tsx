import React from 'react'
import { Alert, Button, Card } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useL10n } from '@reprman/localization'

interface HomeAuthCardProps {
  /**
   * Whether Cognito env vars were baked into this build. When `false`, an
   * informational alert appears explaining what is missing.
   */
  authReady: boolean
}

/**
 * Signed-out landing card for the home route. Offers Sign In / Sign Up
 * navigation and surfaces a setup hint when Cognito is not configured.
 */
const HomeAuthCard = ({ authReady }: HomeAuthCardProps) => {
  const navigate = useNavigate()
  const { t } = useL10n()

  return (
    <div id="Home-page" className="w-100 d-flex justify-content-center">
      <Card style={{ maxWidth: 480 }} className="w-100">
        <Card.Body>
          <Card.Title>{t('auth.homeSignedOutTitle')}</Card.Title>
          <Card.Text className="text-muted mb-3">
            {t('auth.homeSignedOutBody')}
          </Card.Text>
          {!authReady ? (
            <Alert variant="warning" className="mb-3">
              {t('auth.homeCognitoEnvMissing')}
            </Alert>
          ) : null}
          <div className="d-grid gap-2">
            <Button
              variant="primary"
              type="button"
              onClick={() => navigate('/signin')}
            >
              {t('auth.signInButton')}
            </Button>
            <Button
              variant="outline-primary"
              type="button"
              onClick={() => navigate('/signup')}
            >
              {t('auth.signUpButton')}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}

export default HomeAuthCard
