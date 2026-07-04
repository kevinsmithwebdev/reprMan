import React from 'react'
import { Stack } from 'expo-router'

const AuthLayout = () => (
  <Stack
    screenOptions={{
      headerShown: true,
      headerBackTitleVisible: false,
    }}
  />
)

export default AuthLayout
