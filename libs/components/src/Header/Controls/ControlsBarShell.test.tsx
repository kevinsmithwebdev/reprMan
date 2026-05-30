import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import ControlsBarShell from './ControlsBarShell'

describe('ControlsBarShell', () => {
  it('renders a bar with margin when not bleeding full viewport', () => {
    render(
      <ControlsBarShell id="controls-bar" variant="homeRow" marginBottomPx={16}>
        <span>child</span>
      </ControlsBarShell>
    )

    const bar = document.getElementById('controls-bar')
    expect(bar).toBeTruthy()
    expect(bar?.style.marginBottom).toBe('16px')
    expect(screen.getByText('child')).toBeTruthy()
  })

  it('wraps the bar when bleeding full viewport', () => {
    render(
      <ControlsBarShell
        id="controls-bar-bleed"
        variant="reportsWrap"
        bleedFullViewport
        marginBottomPx={12}
      >
        <span>bleed child</span>
      </ControlsBarShell>
    )

    const bar = document.getElementById('controls-bar-bleed')
    expect(bar).toBeTruthy()
    expect(bar?.parentElement?.style.marginBottom).toBe('12px')
    expect(screen.getByText('bleed child')).toBeTruthy()
  })
})
