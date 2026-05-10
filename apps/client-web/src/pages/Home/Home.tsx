import React from 'react'
import { CenteredSpinner, HomeAuthCard, ReprsList } from '@reprman/components'
import {
  homeAuthGateActive,
  isCognitoConfigured,
  useCognitoAuth,
} from '@reprman/cognito-auth'
import { useCategories, useReprs } from '@reprman/state'

import { getFilteredReprs } from './Home.helpers'

const Home = () => {
  const { reprs, reprsLoaded } = useReprs()
  const { filter } = useCategories()
  const { sessionChecked, signedIn } = useCognitoAuth()

  if (homeAuthGateActive && isCognitoConfigured && !sessionChecked) {
    return <CenteredSpinner id="Home-page" />
  }

  if (homeAuthGateActive && !signedIn) {
    return <HomeAuthCard authReady={isCognitoConfigured} />
  }

  if (!reprsLoaded) {
    return <CenteredSpinner id="Home-page" layout="fill" />
  }

  return (
    <div id="Home-page" className="h-100">
      <ReprsList reprs={getFilteredReprs(reprs, filter)} />
    </div>
  )
}

export default Home
