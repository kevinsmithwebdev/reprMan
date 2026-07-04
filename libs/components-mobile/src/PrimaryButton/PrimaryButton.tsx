import React, { FC } from 'react'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native'

export type PrimaryButtonProps = {
  label: string
  onPress: () => void
  disabled?: boolean
  busy?: boolean
  variant?: 'primary' | 'danger' | 'success'
  style?: ViewStyle
  testID?: string
}

const variantColors = {
  primary: '#0c63e4',
  danger: '#dc3545',
  success: '#198754',
}

const PrimaryButton: FC<PrimaryButtonProps> = ({
  label,
  onPress,
  disabled = false,
  busy = false,
  variant = 'primary',
  style,
  testID,
}) => {
  const isDisabled = disabled || busy

  return (
    <Pressable
      testID={testID}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: variantColors[variant] },
        pressed && !isDisabled ? styles.pressed : null,
        isDisabled ? styles.disabled : null,
        style,
      ]}
      disabled={isDisabled}
      onPress={onPress}
    >
      {busy ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  label: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
})

export default PrimaryButton
