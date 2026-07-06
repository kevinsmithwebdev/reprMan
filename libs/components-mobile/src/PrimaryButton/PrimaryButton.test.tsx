import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

vi.mock('react-native', () => {
  // eslint-disable-next-line global-require -- vitest mock factory runs before ESM imports
  const ReactNative = require('react')
  return {
    ActivityIndicator: () => null,
    Pressable: ({
      onPress,
      children,
      testID,
      disabled,
    }: {
      onPress?: () => void
      children?: React.ReactNode
      testID?: string
      disabled?: boolean
    }) =>
      ReactNative.createElement(
        'button',
        { type: 'button', onClick: onPress, 'data-testid': testID, disabled },
        children
      ),
    StyleSheet: { create: (styles: object) => styles },
    Text: ({ children }: { children?: React.ReactNode }) =>
      ReactNative.createElement('span', null, children),
  }
})

// eslint-disable-next-line import/first -- mocked react-native must initialize first
import PrimaryButton from './PrimaryButton'

describe('PrimaryButton', () => {
  it('renders label and handles press', () => {
    const onPress = vi.fn()

    render(<PrimaryButton label="Save" onPress={onPress} testID="save-btn" />)

    fireEvent.click(screen.getByTestId('save-btn'))
    expect(onPress).toHaveBeenCalledTimes(1)
    expect(screen.getByText('Save')).toBeInTheDocument()
  })

  it('does not call onPress when disabled', () => {
    const onPress = vi.fn()

    render(
      <PrimaryButton
        label="Save"
        onPress={onPress}
        disabled
        testID="save-btn"
      />
    )

    fireEvent.click(screen.getByTestId('save-btn'))
    expect(onPress).not.toHaveBeenCalled()
  })
})
