import { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { isCognitoConfigured, useCognitoAuth } from '@reprman/cognito-auth'
import { runGenesisSaga } from '@reprman/state/sagas/genesis/genesis.actions'

/**
 * Mirrors web AppShell: load reprs once Cognito session is known.
 */
export function GenesisBootstrap() {
  const dispatch = useDispatch()
  const { sessionChecked, signedIn } = useCognitoAuth()
  const initialGenesisDone = useRef(false)

  useEffect(() => {
    if (isCognitoConfigured() && !sessionChecked) {
      return
    }
    if (initialGenesisDone.current) {
      return
    }
    initialGenesisDone.current = true
    dispatch(runGenesisSaga(signedIn ? { afterSignIn: true } : undefined))
  }, [dispatch, sessionChecked, signedIn])

  return null
}
