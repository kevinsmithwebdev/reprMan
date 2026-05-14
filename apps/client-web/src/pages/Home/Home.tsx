import React from 'react'
import {
  CenteredSpinner,
  ControlsHome,
  HomeAuthCard,
  ReprsList,
} from '@reprman/components'
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
    return <CenteredSpinner id="Home-page" layout="fill" />
  }

  if (homeAuthGateActive && !signedIn) {
    return (
      <div
        id="Home-page"
        className="app-page-padded d-flex flex-grow-1 justify-content-center"
        style={{ minHeight: 0 }}
      >
        <HomeAuthCard authReady={isCognitoConfigured} />
      </div>
    )
  }

  if (!reprsLoaded) {
    return <CenteredSpinner id="Home-page" layout="fill" />
  }

  return (
    <div id="Home-page" className="app-route-page-fill">
      <div className="app-route-toolbar app-scroll-full-bleed">
        <ControlsHome />
      </div>
      <div className="app-route-scroll-host app-scroll-full-bleed">
        <div className="app-route-scroll">
          <div className="app-route-scroll-inner">
            <ReprsList reprs={getFilteredReprs(reprs, filter)} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
