import React from 'react'
import AuthModule from 'modules/auth/auth.module'
import { Navigate, useLocation } from 'react-router-dom'

interface AuthContextType {
  user: any
  signIn: (user: string, callback: VoidFunction) => void
  signOut: (callback: VoidFunction) => void
}

const AuthContext = React.createContext<AuthContextType>(null!)

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<any>(null)

  const signIn = (newUser: string, callback: VoidFunction) => {
    return AuthModule.signIn(() => {
      setUser(newUser)
      callback()
    })
  }

  const signOut = (callback: VoidFunction) => {
    return AuthModule.signOut(() => {
      setUser(null)
      callback()
    })
  }

  const value = { user, signIn, signOut }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const auth = useAuth()
  // const auth = {user: 'asdf'}
  const location = useLocation()
  console.log('RequireAuth', auth, location)

  if (!auth.user) {
    return <Navigate to="/signin" state={{ from: location }} replace />
  }

  return children
}

export default AuthProvider

const useAuth = () => {
  return React.useContext(AuthContext)
}
