import { useEffect, useRef } from 'react'
import { Alert } from 'react-native'
import { useDispatch } from 'react-redux'
import { useToasts } from '@reprman/state/toasts'
import { removeToastAC } from '@reprman/state/toasts/toasts.actions'
import { ToastLevel } from '@reprman/types'

const toastTitle = (level: ToastLevel): string => {
  if (level === ToastLevel.FAIL) {
    return 'Error'
  }
  if (level === ToastLevel.WARNING) {
    return 'Warning'
  }
  if (level === ToastLevel.SUCCESS) {
    return 'Success'
  }
  return 'Info'
}

/**
 * Surfaces Redux toasts from shared auth hooks via native alerts.
 */
export function ToastBridge() {
  const dispatch = useDispatch()
  const { toasts } = useToasts()
  const seenIds = useRef(new Set<string>())

  useEffect(() => {
    toasts
      .filter((toast) => !seenIds.current.has(toast.id))
      .forEach((toast) => {
        seenIds.current.add(toast.id)
        Alert.alert(toastTitle(toast.level), toast.body, [
          {
            text: 'OK',
            onPress: () => dispatch(removeToastAC(toast.id)),
          },
        ])
      })
  }, [dispatch, toasts])

  return null
}
