import { useCognitoAuth } from './CognitoAuthContext'
import { homeAuthGateActive, isCognitoConfigured } from './configureAmplify'

export const useAuthGate = () => {
  const { signedIn, sessionChecked } = useCognitoAuth()
  const gateActive = homeAuthGateActive()

  return {
    gateActive,
    signedIn,
    sessionChecked,
    isLoading: gateActive && isCognitoConfigured() && !sessionChecked,
    isSignedOut: gateActive && sessionChecked && !signedIn,
  }
}
