'use client'

export { CognitoAuthProvider, useCognitoAuth } from './CognitoAuthContext'
export { useCognitoChangePassword } from './useCognitoChangePassword'
export { useCognitoForgotPassword } from './useCognitoForgotPassword'
export { useCognitoSignIn } from './useCognitoSignIn'
export { useCognitoSignOut } from './useCognitoSignOut'
export { useCognitoSignUp } from './useCognitoSignUp'
export { userFromCognitoSession } from './cognitoSession'
export type { AuthSubmitEvent } from './authSubmitEvent'
export {
  allowAnonymousHome,
  configureAmplify,
  homeAuthGateActive,
  isCognitoConfigured,
  requireHomeSignInWall,
} from './configureAmplify'
export { useAuthGate } from './useAuthGate'
export { useAuthGateRedirect } from './useAuthGateRedirect'
export type {
  AuthGateRedirectOptions,
  AuthGateState,
} from './useAuthGateRedirect'
export { useAcceptTermsGate } from './useAcceptTermsGate'
export type { UseAcceptTermsGateOptions } from './useAcceptTermsGate'
