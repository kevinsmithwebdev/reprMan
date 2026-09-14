'use client'

import React from 'react'
import { CenteredSpinner, ControlsHome, ReprsList } from '@reprman/components'
import { useAuthGate } from '@reprman/cognito-auth'
import { useCategories, useReprs } from '@reprman/state'
import { getFilteredReprs } from '@reprman/utilities'
import { useReplaceWhen } from '../hooks/useReplaceWhen'

export const HomePage = () => {
  const { reprs, reprsLoaded } = useReprs()
  const { filter } = useCategories()
  const { isLoading, isSignedOut } = useAuthGate()

  useReplaceWhen(isSignedOut && !isLoading, '/signin')

  if (isLoading) {
    return <CenteredSpinner id="Home-page" layout="fill" />
  }

  if (isSignedOut) {
    return null
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
