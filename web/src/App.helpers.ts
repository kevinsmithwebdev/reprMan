import { Auth } from 'aws-amplify'
import { useEffect, useState } from 'react'
import store from 'state/store'
import { clearUser, setUser } from 'state/user/user.actions'

const getUserObjectFromAttributes = (attributes: any) => ({
  email: attributes.email,
  id: attributes.sub,
})

export const listenToAuth = (data: any) => {
  switch (data.payload.event) {
    case 'signIn':
    case 'signUp':
      store.dispatch(
        setUser(getUserObjectFromAttributes(data.payload.data.attributes))
      )
      break

    case 'signOut':
    case 'signIn_failure':
      store.dispatch(clearUser())
      break

    case 'tokenRefresh_failure':
      store.dispatch(clearUser())
      break

    case 'tokenRefresh':
    case 'configured':
      break
    default:
  }
}

export const useAuthLoading = () => {
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)

  useEffect(() => {
    const checkForSignedIn = async () => {
      try {
        const user = await Auth.currentAuthenticatedUser()
        store.dispatch(setUser(getUserObjectFromAttributes(user.attributes)))
        return
      } catch {
        store.dispatch(clearUser())
      } finally {
        setIsLoadingAuth(false)
      }
    }
    checkForSignedIn()
  }, [])

  return { isLoadingAuth }
}
