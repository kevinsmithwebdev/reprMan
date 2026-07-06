import { act, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import i18next from '@reprman/localization/setupI18n'
import { renderWithAppShell } from '../../../../apps/client-web/src/test-utils'
import Header, { initialNarrowBrand } from './Header'

describe('initialNarrowBrand', () => {
  it('is false when window is unavailable', () => {
    const savedWindow = globalThis.window
    Reflect.deleteProperty(globalThis, 'window')

    try {
      expect(initialNarrowBrand()).toBe(false)
    } finally {
      globalThis.window = savedWindow
    }
  })
})

describe('Header', () => {
  it('syncs narrow brand when matchMedia reports a narrow viewport', () => {
    globalThis.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('max-width'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    renderWithAppShell(<Header />, { initialPathname: '/about' })
    expect(screen.getByText(/HOME/i)).toBeTruthy()
    const brand = document.getElementById('header-brand')
    expect(brand?.textContent).not.toMatch(/Repertoire Management/i)
  })

  it('updates the navbar brand when the language changes', async () => {
    globalThis.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    await i18next.changeLanguage('en')
    renderWithAppShell(<Header />, { initialPathname: '/' })

    const brand = document.getElementById('header-brand')
    expect(brand?.textContent).toMatch(/Repertoire Management/i)

    await act(async () => {
      await i18next.changeLanguage('es')
    })

    expect(brand?.textContent).toMatch(/Gestión de repertorio/i)
    expect(brand?.textContent).not.toMatch(/Repertoire Management/i)

    await i18next.changeLanguage('en')
  })
})
