import React from 'react'
import { Stack } from 'expo-router'

const AuthLayout = () => (
  <Stack
    screenOptions={{
      headerShown: true,
      headerBackButtonDisplayMode: 'minimal',
    }}
  />
)

export default AuthLayout
