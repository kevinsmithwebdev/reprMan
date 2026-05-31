import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { configureMock } = vi.hoisted(() => ({
  configureMock: vi.fn(),
}))

vi.mock('aws-amplify', () => ({
  Amplify: { configure: configureMock },
}))

// setupTests.ts mocks this module for other suites; test the real implementation here.
vi.mock('@reprman/cognito-auth/configureAmplify', async (importOriginal) =>
  importOriginal<typeof import('./configureAmplify')>()
)

describe('configureAmplify', () => {
  beforeEach(() => {
    configureMock.mockReset()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  async function loadModule(env: Record<string, string>) {
    vi.resetModules()
    vi.unstubAllEnvs()
    Object.entries(env).forEach(([key, value]) => {
      vi.stubEnv(key, value)
    })
    return import('./configureAmplify')
  }

  it('reports Cognito as unconfigured when pool env vars are missing', async () => {
    const mod = await loadModule({
      VITE_COGNITO_USER_POOL_ID: '',
      VITE_COGNITO_USER_POOL_CLIENT_ID: '',
      VITE_REQUIRE_HOME_SIGN_IN: 'false',
      VITE_ALLOW_ANONYMOUS_HOME: 'false',
    })

    expect(mod.isCognitoConfigured()).toBe(false)
    expect(mod.homeAuthGateActive()).toBe(true)
  })

  it('derives auth gate flags from env', async () => {
    const mod = await loadModule({
      VITE_COGNITO_USER_POOL_ID: ' pool ',
      VITE_COGNITO_USER_POOL_CLIENT_ID: ' client ',
      VITE_REQUIRE_HOME_SIGN_IN: 'true',
      VITE_ALLOW_ANONYMOUS_HOME: 'true',
    })

    expect(mod.isCognitoConfigured()).toBe(true)
    expect(mod.requireHomeSignInWall()).toBe(true)
    expect(mod.allowAnonymousHome()).toBe(true)
    expect(mod.homeAuthGateActive()).toBe(true)
  })

  it('turns off home auth gate when anonymous home is allowed and Cognito is missing', async () => {
    const mod = await loadModule({
      VITE_COGNITO_USER_POOL_ID: '',
      VITE_COGNITO_USER_POOL_CLIENT_ID: '',
      VITE_REQUIRE_HOME_SIGN_IN: 'false',
      VITE_ALLOW_ANONYMOUS_HOME: 'true',
    })

    expect(mod.homeAuthGateActive()).toBe(false)
  })

  it('logs missing env and skips Amplify when Cognito is not configured', async () => {
    const { configureAmplify } = await loadModule({
      VITE_COGNITO_USER_POOL_ID: '',
      VITE_COGNITO_USER_POOL_CLIENT_ID: '',
      VITE_REPRS_API_BASE_URL: '',
    })

    configureAmplify()

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Missing Cognito configuration')
    )
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Missing VITE_REPRS_API_BASE_URL')
    )
    expect(configureMock).not.toHaveBeenCalled()
  })

  it('configures Amplify with user pool only', async () => {
    const { configureAmplify } = await loadModule({
      VITE_COGNITO_USER_POOL_ID: 'pool-id',
      VITE_COGNITO_USER_POOL_CLIENT_ID: 'client-id',
      VITE_COGNITO_IDENTITY_POOL_ID: '',
      VITE_REPRS_API_BASE_URL: 'https://api.example.com',
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
      VITE_COGNITO_USER_POOL_ID: 'pool-id',
      VITE_COGNITO_USER_POOL_CLIENT_ID: 'client-id',
      VITE_COGNITO_IDENTITY_POOL_ID: 'identity-pool',
      VITE_REPRS_API_BASE_URL: 'https://api.example.com',
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
