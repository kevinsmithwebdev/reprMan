import React, { FC } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useDispatch } from 'react-redux'
import { removeToastAC, useToasts } from '@reprman/state/toasts'
import { ToastData, ToastLevel } from '@reprman/types'

const BG_COLORS_BY_LEVEL = {
  [ToastLevel.SUCCESS]: { title: '#009933', body: '#b3ffcc' },
  [ToastLevel.FAIL]: { title: '#ff3300', body: '#ffc2b3' },
  [ToastLevel.INFO]: { title: '#0059b3', body: '#cce6ff' },
  [ToastLevel.WARNING]: { title: '#ff9900', body: '#ffe0b3' },
}

const ToastHost: FC = () => {
  const { toasts } = useToasts()
  const dispatch = useDispatch()

  if (!toasts.length) {
    return null
  }

  return (
    <View style={styles.container} pointerEvents="box-none">
      {toasts.map((toast) => (
        <ToastCard
          key={toast.id}
          toast={toast}
          onDismiss={() => dispatch(removeToastAC(toast.id))}
        />
      ))}
    </View>
  )
}

const ToastCard: FC<{
  toast: ToastData
  onDismiss: () => void
}> = ({ toast, onDismiss }) => {
  const colors = BG_COLORS_BY_LEVEL[toast.level ?? ToastLevel.INFO]
  const title = toast.title ?? ''

  return (
    <Pressable
      style={[styles.toast, { backgroundColor: colors.body }]}
      onPress={onDismiss}
      testID={`toast-${toast.id}`}
    >
      {!!title && (
        <Text style={[styles.toastTitle, { color: colors.title }]}>
          {title.toUpperCase()}
        </Text>
      )}
      <Text style={styles.toastBody}>{toast.body}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    gap: 8,
  },
  toast: {
    borderRadius: 8,
    padding: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  toastTitle: {
    fontWeight: '800',
    marginBottom: 4,
  },
  toastBody: {
    color: '#222',
  },
})

export default ToastHost
