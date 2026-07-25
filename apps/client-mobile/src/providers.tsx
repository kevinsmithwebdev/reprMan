import React, { useEffect } from 'react'
import { Provider } from 'react-redux'
import { createExpoClientConfig, setClientConfig } from '@reprman/client-config'
import { CognitoAuthProvider, configureAmplify } from '@reprman/cognito-auth'
import { configureReprsApi } from '@reprman/reprs-api'
import store from '@reprman/state/store'

import { ToastBridge } from '@/components/toast-bridge'
import { GenesisBootstrap } from '@/components/genesis-bootstrap'

let configured = false

const ensureClientConfigured = () => {
  if (configured) {
    return
  }
  setClientConfig(createExpoClientConfig())
  configureReprsApi()
  configureAmplify()
  configured = true
}

ensureClientConfigured()

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    ensureClientConfigured()
  }, [])

  return (
    <Provider store={store}>
      <CognitoAuthProvider>
        <GenesisBootstrap />
        <ToastBridge />
        {children}
      </CognitoAuthProvider>
    </Provider>
  )
}
