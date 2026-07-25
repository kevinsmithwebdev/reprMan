import 'react-native-get-random-values'

import { Stack, useRouter, useSegments } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { isCognitoConfigured, useCognitoAuth } from '@reprman/cognito-auth'

import { Providers } from '@/providers'

SplashScreen.preventAutoHideAsync()

function AuthNavigator() {
  const router = useRouter()
  const segments = useSegments()
  const { sessionChecked, signedIn } = useCognitoAuth()
  const cognitoReady = isCognitoConfigured()

  useEffect(() => {
    if (cognitoReady && !sessionChecked) {
      return
    }

    SplashScreen.hideAsync().catch(() => {})

    const inAuthGroup = segments[0] === 'sign-in' || segments[0] === 'sign-up'

    if (!cognitoReady) {
      if (!inAuthGroup) {
        router.replace('/sign-in')
      }
      return
    }

    if (signedIn && inAuthGroup) {
      router.replace('/dashboard')
      return
    }

    if (!signedIn && !inAuthGroup) {
      router.replace('/sign-in')
    }
  }, [cognitoReady, router, segments, sessionChecked, signedIn])

  if (cognitoReady && !sessionChecked) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="sign-in" options={{ title: 'Sign in' }} />
      <Stack.Screen name="sign-up" options={{ title: 'Create account' }} />
      <Stack.Screen name="dashboard" options={{ title: 'Dashboard' }} />
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <Providers>
      <AuthNavigator />
    </Providers>
  )
}
