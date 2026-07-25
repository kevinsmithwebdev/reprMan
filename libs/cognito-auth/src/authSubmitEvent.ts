/**
 * Optional submit event shape shared by Cognito auth hooks.
 * Web forms pass a React FormEvent; React Native can omit it or pass a stub.
 */
export type AuthSubmitEvent = {
  preventDefault: () => void
}
