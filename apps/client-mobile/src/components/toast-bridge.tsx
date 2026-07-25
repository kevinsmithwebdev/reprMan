import { useEffect, useRef } from 'react'
import { Alert } from 'react-native'
import { useDispatch } from 'react-redux'
import { useToasts } from '@reprman/state/toasts'
import { removeToastAC } from '@reprman/state/toasts/toasts.actions'
import { ToastLevel } from '@reprman/types'

/**
 * Surfaces Redux toasts from shared auth hooks via native alerts.
 */
export function ToastBridge() {
  const dispatch = useDispatch()
  const { toasts } = useToasts()
  const seenIds = useRef(new Set<string>())

  useEffect(() => {
    for (const toast of toasts) {
      if (seenIds.current.has(toast.id)) {
        continue
      }
      seenIds.current.add(toast.id)

      const title =
        toast.level === ToastLevel.FAIL
          ? 'Error'
          : toast.level === ToastLevel.WARNING
          ? 'Warning'
          : toast.level === ToastLevel.SUCCESS
          ? 'Success'
          : 'Info'

      Alert.alert(title, toast.body, [
        {
          text: 'OK',
          onPress: () => dispatch(removeToastAC(toast.id)),
        },
      ])
    }
  }, [dispatch, toasts])

  return null
}
