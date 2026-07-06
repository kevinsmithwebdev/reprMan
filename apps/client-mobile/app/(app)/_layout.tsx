import React from 'react'
import { Redirect, Stack } from 'expo-router'
import { isCognitoConfigured, useAuthGate } from '@reprman/cognito-auth'
import { LoadingOverlay } from '@reprman/components-mobile'

const AppLayout = () => {
  const { isLoading, isSignedOut } = useAuthGate()

  if (!isCognitoConfigured()) {
    return <Redirect href="/(auth)/sign-in" />
  }

  if (isLoading) {
    return <LoadingOverlay />
  }

  if (isSignedOut) {
    return <Redirect href="/(auth)/sign-in" />
  }

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackButtonDisplayMode: 'minimal',
      }}
    />
  )
}

export default AppLayout
