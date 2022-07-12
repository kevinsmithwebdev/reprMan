import store from 'state/store'
import { clearUser, setUser } from 'state/user/user.actions'

export const listenToAuth = (data: any) => {
  switch (data.payload.event) {
    case 'signIn':
    case 'signUp':
      store.dispatch(
        setUser({
          email: data.payload.data.attributes.email,
        })
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
