import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  loadedAppState,
  navigationMocks,
  renderWithAppShell,
  setMockParams,
  testRepr,
} from '../test-utils'
import { HomePage } from './HomePage'
import ReportsView from './ReportsView'
import SettingsView from './SettingsView'
import SubscribeView from './SubscribeView'
import ViewReprView from './ViewReprView'

const gateMocks = vi.hoisted(() => ({
  sessionChecked: true,
  signedIn: true,
  homeAuthGateActive: true,
  cognitoConfigured: true,
  isReprsApiConfigured: true,
  createCheckoutSession: vi.fn<() => Promise<{ url: string }>>(),
  locationAssign: vi.fn(),
}))

vi.mock('@reprman/cognito-auth/configureAmplify', async (importOriginal) => {
  const actual = await importOriginal<
    typeof import('@reprman/cognito-auth/configureAmplify')
  >()
  return {
    ...actual,
    homeAuthGateActive: () => gateMocks.homeAuthGateActive,
    isCognitoConfigured: () => gateMocks.cognitoConfigured,
  }
})

vi.mock('@reprman/cognito-auth/CognitoAuthContext', async (importOriginal) => {
  const actual = await importOriginal<
    typeof import('@reprman/cognito-auth/CognitoAuthContext')
  >()
  return {
    ...actual,
    useCognitoAuth: () => ({
      sessionChecked: gateMocks.sessionChecked,
      signedIn: gateMocks.signedIn,
      refreshSession: vi.fn(),
    }),
  }
})

vi.mock('@reprman/reprs-api', () => ({
  get isReprsApiConfigured() {
    return gateMocks.isReprsApiConfigured
  },
  ReprsApiModule: {
    getInstance: () => ({
      createCheckoutSession: gateMocks.createCheckoutSession,
      acceptTerms: vi.fn(),
    }),
  },
}))

describe('protected views', () => {
  beforeEach(() => {
    gateMocks.sessionChecked = true
    gateMocks.signedIn = true
    gateMocks.homeAuthGateActive = true
    gateMocks.cognitoConfigured = true
    gateMocks.isReprsApiConfigured = true
    gateMocks.createCheckoutSession.mockReset()
    gateMocks.locationAssign.mockReset()
    navigationMocks.replace.mockClear()
    navigationMocks.back.mockClear()
    setMockParams({ id: 'repr-1' })
    vi.stubGlobal('location', { assign: gateMocks.locationAssign })
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
  })

  it('shows home auth card when signed out', () => {
    gateMocks.signedIn = false
    renderWithAppShell(<HomePage />, { preloadedState: loadedAppState() })
    expect(document.getElementById('Home-page')).toBeTruthy()
    expect(screen.getByText('ReprMan')).toBeTruthy()
  })

  it('renders repr list on home when signed in', () => {
    renderWithAppShell(<HomePage />, {
      preloadedState: loadedAppState([testRepr()]),
    })
    expect(document.getElementById('Home-page')).toBeTruthy()
    expect(screen.getByText('Test repr')).toBeTruthy()
  })

  it('shows loading spinner on home while reprs are not loaded', () => {
    renderWithAppShell(<HomePage />)
    expect(document.getElementById('Home-page')).toBeTruthy()
  })

  it('renders reports and copies clipboard text', async () => {
    const { store } = renderWithAppShell(<ReportsView />, {
      preloadedState: loadedAppState([testRepr()]),
    })

    expect(document.getElementById('Reports-page')).toBeTruthy()
    await userEvent.click(
      screen.getByRole('button', { name: /Copy list to clipboard/i })
    )
    expect(navigator.clipboard.writeText).toHaveBeenCalled()
    expect(store.getState().toasts).toBeTruthy()
  })

  it('shows signed-out reports auth card', () => {
    gateMocks.signedIn = false
    renderWithAppShell(<ReportsView />, {
      preloadedState: loadedAppState([testRepr()]),
    })
    expect(screen.getByText('ReprMan')).toBeTruthy()
  })

  it('saves settings and dispatches supplemental actions', async () => {
    const { store } = renderWithAppShell(<SettingsView />, {
      preloadedState: loadedAppState(),
    })

    expect(document.getElementById('Settings-page')).toBeTruthy()
    await userEvent.click(
      screen.getByRole('button', { name: /Save Settings Changes/i })
    )
    await userEvent.click(
      screen.getByRole('button', { name: /Reset All Settings/i })
    )
    expect(store.getState().settings).toBeTruthy()
  })

  it('redirects signed-out users from settings', () => {
    gateMocks.signedIn = false
    const { container } = renderWithAppShell(<SettingsView />)
    expect(container.firstChild).toBeNull()
    expect(navigationMocks.replace).toHaveBeenCalledWith('/')
  })

  it('starts checkout from subscribe view', async () => {
    gateMocks.createCheckoutSession.mockResolvedValue({
      url: 'https://checkout.example.com',
    })

    renderWithAppShell(<SubscribeView />)
    await userEvent.click(screen.getByRole('button', { name: /^Subscribe$/i }))
    await waitFor(() => {
      expect(gateMocks.locationAssign).toHaveBeenCalledWith(
        'https://checkout.example.com'
      )
    })
  })

  it('redirects signed-out users from subscribe', () => {
    gateMocks.signedIn = false
    const { container } = renderWithAppShell(<SubscribeView />)
    expect(container.firstChild).toBeNull()
    expect(navigationMocks.replace).toHaveBeenCalledWith('/signin')
  })

  it('renders repr details and navigates back', async () => {
    renderWithAppShell(<ViewReprView />, {
      preloadedState: loadedAppState([testRepr()]),
    })

    expect(screen.getByText('Test repr')).toBeTruthy()
    await userEvent.click(screen.getByRole('button', { name: /^Back$/i }))
    expect(navigationMocks.back).toHaveBeenCalled()
  })

  it('redirects when repr is missing', () => {
    setMockParams({ id: 'missing' })
    const { container } = renderWithAppShell(<ViewReprView />, {
      preloadedState: loadedAppState([testRepr()]),
    })
    expect(container.firstChild).toBeNull()
    expect(navigationMocks.replace).toHaveBeenCalledWith('/')
  })
})
