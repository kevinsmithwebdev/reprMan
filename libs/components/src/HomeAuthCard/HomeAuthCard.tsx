import React from 'react'
import Link from 'next/link'
import { Alert, Card } from 'react-bootstrap'
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
  const { t } = useL10n()
  const missingAuthMessageKey =
    process.env.NODE_ENV === 'development'
      ? 'auth.homeCognitoEnvMissingDev'
      : 'auth.homeCognitoEnvMissingProd'

  return (
    <div className="w-100 d-flex justify-content-center">
      <Card style={{ maxWidth: 480 }} className="w-100">
        <Card.Body>
          <Card.Title>{t('auth.homeSignedOutTitle')}</Card.Title>
          <Card.Text className="text-muted mb-3">
            {t('auth.homeSignedOutBody')}
          </Card.Text>
          {authReady ? null : (
            <Alert variant="warning" className="mb-3">
              {t(missingAuthMessageKey)}
            </Alert>
          )}
          <div className="d-grid gap-2">
            <Link href="/signin" className="btn btn-primary">
              {t('auth.signInButton')}
            </Link>
            <Link href="/signup" className="btn btn-outline-primary">
              {t('auth.signUpButton')}
            </Link>
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}

export default HomeAuthCard
