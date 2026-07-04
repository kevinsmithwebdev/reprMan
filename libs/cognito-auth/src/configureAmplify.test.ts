import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ClientConfig } from '@reprman/client-config'

const { configureMock } = vi.hoisted(() => ({
  configureMock: vi.fn(),
}))

vi.mock('aws-amplify', () => ({
  Amplify: { configure: configureMock },
}))

vi.unmock('@reprman/cognito-auth/configureAmplify')

const baseConfig = (): ClientConfig => ({
  cognitoUserPoolId: '',
  cognitoUserPoolClientId: '',
  cognitoIdentityPoolId: '',
  reprsApiBaseUrl: '',
  requireHomeSignIn: false,
  allowAnonymousHome: false,
})

describe('configureAmplify', () => {
  beforeEach(() => {
    configureMock.mockReset()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  async function loadModule(config: ClientConfig = baseConfig()) {
    vi.resetModules()
    vi.doUnmock('@reprman/cognito-auth/configureAmplify')
    const { setClientConfig } = await import('@reprman/client-config')
    setClientConfig(config)
    return vi.importActual<
      typeof import('@reprman/cognito-auth/configureAmplify')
    >('@reprman/cognito-auth/configureAmplify')
  }

  it('reports Cognito as unconfigured when pool env vars are missing', async () => {
    const mod = await loadModule(baseConfig())

    expect(mod.isCognitoConfigured()).toBe(false)
    expect(mod.homeAuthGateActive()).toBe(true)
  })

  it('derives auth gate flags from env', async () => {
    const mod = await loadModule({
      ...baseConfig(),
      cognitoUserPoolId: 'pool',
      cognitoUserPoolClientId: 'client',
      requireHomeSignIn: true,
      allowAnonymousHome: true,
    })

    expect(mod.isCognitoConfigured()).toBe(true)
    expect(mod.requireHomeSignInWall()).toBe(true)
    expect(mod.allowAnonymousHome()).toBe(true)
    expect(mod.homeAuthGateActive()).toBe(true)
  })

  it('turns off home auth gate when anonymous home is allowed and Cognito is missing', async () => {
    const mod = await loadModule({
      ...baseConfig(),
      allowAnonymousHome: true,
    })

    expect(mod.homeAuthGateActive()).toBe(false)
  })

  it('logs missing env and skips Amplify when Cognito is not configured', async () => {
    const { configureAmplify } = await loadModule(baseConfig())

    configureAmplify()

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Missing Cognito configuration')
    )
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Missing reprs API base URL')
    )
    expect(configureMock).not.toHaveBeenCalled()
  })

  it('configures Amplify with user pool only', async () => {
    const { configureAmplify } = await loadModule({
      ...baseConfig(),
      cognitoUserPoolId: 'pool-id',
      cognitoUserPoolClientId: 'client-id',
      reprsApiBaseUrl: 'https://api.example.com',
    })

    configureAmplify()

    expect(configureMock).toHaveBeenCalledWith({
      Auth: {
        Cognito: {
          userPoolId: 'pool-id',
          userPoolClientId: 'client-id',
          loginWith: { email: true },
        },
      },
    })
  })

  it('configures Amplify with identity pool when provided', async () => {
    const { configureAmplify } = await loadModule({
      ...baseConfig(),
      cognitoUserPoolId: 'pool-id',
      cognitoUserPoolClientId: 'client-id',
      cognitoIdentityPoolId: 'identity-pool',
      reprsApiBaseUrl: 'https://api.example.com',
    })

    configureAmplify()

    expect(configureMock).toHaveBeenCalledWith({
      Auth: {
        Cognito: {
          userPoolId: 'pool-id',
          userPoolClientId: 'client-id',
          identityPoolId: 'identity-pool',
          loginWith: { email: true },
        },
      },
    })
  })
})
