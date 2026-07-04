import React, { FC } from 'react'
import { StyleSheet, View } from 'react-native'
import { isCognitoConfigured, useAuthGate } from '@reprman/cognito-auth'
import { useCategories, useReprs } from '@reprman/state'
import { getFilteredReprs } from '@reprman/utilities'
import AddReprButton from '../AddReprButton'
import AuthUnavailableCard from '../AuthUnavailableCard'
import CategoryFilterInput from '../CategoryFilterInput'
import LoadingOverlay from '../LoadingOverlay'
import ReprsList from '../ReprsList'
import Screen from '../Screen'
import SignInForm from '../SignInForm'

const HomeScreen: FC = () => {
  const { reprs, reprsLoaded } = useReprs()
  const { filter } = useCategories()
  const { isLoading, isSignedOut } = useAuthGate()

  if (!isCognitoConfigured()) {
    return <AuthUnavailableCard />
  }

  if (isLoading) {
    return <LoadingOverlay />
  }

  if (isSignedOut) {
    return <SignInForm />
  }

  if (!reprsLoaded) {
    return <LoadingOverlay />
  }

  return (
    <Screen testID="home-screen">
      <View style={styles.toolbar}>
        <CategoryFilterInput />
        <AddReprButton />
      </View>
      <ReprsList reprs={getFilteredReprs(reprs, filter)} />
    </Screen>
  )
}

const styles = StyleSheet.create({
  toolbar: {
    marginBottom: 8,
  },
})

export default HomeScreen
