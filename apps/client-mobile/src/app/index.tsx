import { Redirect } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'
import { isCognitoConfigured, useCognitoAuth } from '@reprman/cognito-auth'

export default function Index() {
  const { sessionChecked, signedIn } = useCognitoAuth()

  if (isCognitoConfigured() && !sessionChecked) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return <Redirect href={signedIn ? '/dashboard' : '/sign-in'} />
}
