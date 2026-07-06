import React, { useEffect, useState } from 'react'
import { Stack } from 'expo-router'
import { Provider, useDispatch } from 'react-redux'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { CognitoAuthProvider } from '@reprman/cognito-auth'
import {
  AcceptTermsGate,
  LoadingOverlay,
  ReprLimitBanner,
  ToastHost,
} from '@reprman/components-mobile'
import { MobileModalHost } from '@reprman/modals-mobile'
import store from '@reprman/state/store'
import { runGenesisSaga } from '@reprman/state/sagas/genesis/genesis.actions'
import { configureMobileApp } from '../src/configureMobileApp'

const MobileAppShell = () => {
  const dispatch = useDispatch()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    configureMobileApp()
      .then(() => {
        dispatch(runGenesisSaga())
        setReady(true)
      })
      .catch((error) => {
        console.error('[mobile] failed to configure app', error)
        setReady(true)
      })
  }, [dispatch])

  if (!ready) {
    return <LoadingOverlay />
  }

  return (
    <>
      <ReprLimitBanner />
      <Stack screenOptions={{ headerShown: false }} />
      <MobileModalHost />
      <AcceptTermsGate />
      <ToastHost />
    </>
  )
}

const RootLayout = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <CognitoAuthProvider>
          <MobileAppShell />
        </CognitoAuthProvider>
      </Provider>
    </GestureHandlerRootView>
  )
}

export default RootLayout
