import '@testing-library/jest-dom'
import { vi } from 'vitest'

// No Amplify in jsdom: real `import.meta.env` can mark Cognito "configured" and
// `CognitoAuthProvider` will call `getCurrentUser()` → console noise + `act` warnings.
vi.mock('@reprman/cognito-auth/configureAmplify', async (importOriginal) => {
  const actual = await importOriginal<
    typeof import('@reprman/cognito-auth/configureAmplify')
  >()
  return {
    ...actual,
    isCognitoConfigured: false,
    homeAuthGateActive: false,
  }
})

// Bridge legacy `jest.*` references in pre-existing test files to vitest's `vi`.
// Lets us migrate without rewriting every `jest.useFakeTimers()` / `jest.spyOn()`.
const globalRef = globalThis as unknown as { jest: typeof vi }
globalRef.jest = vi

// jsdom does not implement matchMedia (used by ReprsList and others).
Object.defineProperty(globalThis, 'matchMedia', {
  writable: true,
  configurable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
