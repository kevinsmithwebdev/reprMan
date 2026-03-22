import { fetchUserAttributes, getCurrentUser } from 'aws-amplify/auth'
import { User } from 'state/user/user.types'

export async function userFromCognitoSession(): Promise<User | null> {
  try {
    const cognitoUser = await getCurrentUser()
    const attrs = await fetchUserAttributes()
    const email = attrs.email ?? cognitoUser.signInDetails?.loginId ?? ''
    return {
      email: String(email),
      name: attrs.name ?? attrs.given_name,
      userId: cognitoUser.userId,
    }
  } catch {
    return null
  }
}
