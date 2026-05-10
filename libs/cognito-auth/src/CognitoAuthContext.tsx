import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useDispatch } from 'react-redux'
import { isCognitoConfigured } from '@reprman/cognito-auth/configureAmplify'
import { clearUser, setUser } from '@reprman/state/user/user.actions'
import { useUser } from '@reprman/state/user/user.hooks'
import { userFromCognitoSession } from './cognitoSession'

export type CognitoAuthContextValue = {
  sessionChecked: boolean
  signedIn: boolean
  refreshSession: () => Promise<void>
}

const CognitoAuthContext = createContext<CognitoAuthContextValue | null>(null)

export const CognitoAuthProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const dispatch = useDispatch()
  const { user } = useUser()
  const [sessionChecked, setSessionChecked] = useState(!isCognitoConfigured)

  const refreshSession = useCallback(async () => {
    if (!isCognitoConfigured) {
      return
    }
    try {
      const next = await userFromCognitoSession()
      if (next) {
        dispatch(setUser(next))
      } else {
        dispatch(clearUser())
      }
    } catch {
      dispatch(clearUser())
    } finally {
      setSessionChecked(true)
    }
  }, [dispatch])

  useEffect(() => {
    if (!isCognitoConfigured) {
      return
    }
    refreshSession()
  }, [refreshSession])

  const signedIn = Boolean(user.email && user.userId)

  const value = useMemo(
    () => ({
      sessionChecked,
      signedIn,
      refreshSession,
    }),
    [sessionChecked, signedIn, refreshSession]
  )

  return (
    <CognitoAuthContext.Provider value={value}>
      {children}
    </CognitoAuthContext.Provider>
  )
}

export function useCognitoAuth(): CognitoAuthContextValue {
  const ctx = useContext(CognitoAuthContext)
  if (!ctx) {
    throw new Error('useCognitoAuth must be used within CognitoAuthProvider')
  }
  return ctx
}
