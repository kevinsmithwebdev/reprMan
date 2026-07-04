export type ClientConfig = {
  cognitoUserPoolId: string
  cognitoUserPoolClientId: string
  cognitoIdentityPoolId: string
  reprsApiBaseUrl: string
  requireHomeSignIn: boolean
  allowAnonymousHome: boolean
}

export const emptyClientConfig = (): ClientConfig => ({
  cognitoUserPoolId: '',
  cognitoUserPoolClientId: '',
  cognitoIdentityPoolId: '',
  reprsApiBaseUrl: '',
  requireHomeSignIn: false,
  allowAnonymousHome: false,
})
