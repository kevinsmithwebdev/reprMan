export interface User {
  name?: string
  email: string
  /** Cognito `sub` when signed in via user pool */
  userId?: string
}
