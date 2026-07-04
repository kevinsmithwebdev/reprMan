import { useEffect } from 'react'
import { useCognitoAuth } from './CognitoAuthContext'
import { homeAuthGateActive, isCognitoConfigured } from './configureAmplify'

export type AuthGateRedirectOptions = {
  signedOutPath: string
  onRedirect: (path: string) => void
}

export type AuthGateState = {
  shouldRender: boolean
  isLoading: boolean
}

/**
 * Shared auth-gate logic for protected screens.
 * Returns whether the screen should render and whether auth is still loading.
 */
export const useAuthGateRedirect = ({
  signedOutPath,
  onRedirect,
}: AuthGateRedirectOptions): AuthGateState => {
  const { signedIn, sessionChecked } = useCognitoAuth()

  useEffect(() => {
    if (!homeAuthGateActive()) {
      return
    }
    if (!sessionChecked) {
      return
    }
    if (!signedIn) {
      onRedirect(signedOutPath)
    }
  }, [onRedirect, sessionChecked, signedIn, signedOutPath])

  if (!homeAuthGateActive()) {
    return { shouldRender: true, isLoading: false }
  }

  if (isCognitoConfigured() && !sessionChecked) {
    return { shouldRender: false, isLoading: true }
  }

  if (!signedIn) {
    return { shouldRender: false, isLoading: false }
  }

  return { shouldRender: true, isLoading: false }
}
