import React from 'react'
import ReprsList from 'components/ReprsList'
import { useReprs } from 'state/reprs'
import { useCategories } from 'state/categories'
import { CategoryFilter, Reprs } from 'types'
import { getDoesContainsAll } from 'utilities'
import { Alert, Button, Card, Spinner } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import {
  homeAuthGateActive,
  isCognitoConfigured,
} from 'config/configureAmplify'
import { useCognitoAuth } from 'modules/CognitoAuth/CognitoAuthContext'
import { useL10n } from 'modules/Localization'

const Home = () => {
  const navigate = useNavigate()
  const { t } = useL10n()
  const { reprs, reprsLoaded } = useReprs()
  const { filter } = useCategories()
  const { sessionChecked, signedIn } = useCognitoAuth()

  const filteredReprs = getFilteredReprs(reprs, filter)

  if (homeAuthGateActive && isCognitoConfigured && !sessionChecked) {
    return (
      <div className="d-flex justify-content-center py-5" id="Home-page">
        <Spinner animation="border" role="status" />
      </div>
    )
  }

  if (homeAuthGateActive && !signedIn) {
    const authReady = isCognitoConfigured
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

  if (!reprsLoaded) {
    return (
      <div
        id="Home-page"
        className="d-flex justify-content-center align-items-center h-100"
      >
        <Spinner animation="border" role="status" />
      </div>
    )
  }

  return (
    <div id="Home-page">
      <ReprsList reprs={filteredReprs} />
    </div>
  )
}

export default Home

const getFilteredReprs = (reprs: Reprs, filter: CategoryFilter) =>
  reprs.filter((r) => {
    const shouldPassForText = r.title
      .toLowerCase()
      .includes(filter.text.toLowerCase())

    const shouldCheckCategories = !!filter.categories.length
    const shouldPassForCategories =
      !shouldCheckCategories ||
      getDoesContainsAll(r.categories, filter.categories)

    return shouldPassForText && shouldPassForCategories
  })
