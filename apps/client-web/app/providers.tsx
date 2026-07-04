'use client'

import React, { useEffect } from 'react'
import { Provider } from 'react-redux'
import { createNextClientConfig, setClientConfig } from '@reprman/client-config'
import { CognitoAuthProvider, configureAmplify } from '@reprman/cognito-auth'
import { configureReprsApi } from '@reprman/reprs-api'
import store from '@reprman/state/store'

let configured = false

const ensureClientConfigured = () => {
  if (configured) {
    return
  }
  setClientConfig(createNextClientConfig())
  configureReprsApi()
  configureAmplify()
  configured = true
}

ensureClientConfigured()

export const Providers = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    ensureClientConfigured()
  }, [])

  return (
    <Provider store={store}>
      <CognitoAuthProvider>{children}</CognitoAuthProvider>
    </Provider>
  )
}
