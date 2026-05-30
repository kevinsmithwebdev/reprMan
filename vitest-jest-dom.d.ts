/// <reference types="@testing-library/jest-dom" />

import type {} from 'vitest'

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Assertion<T = any> extends jest.Matchers<void, T> {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface AsymmetricMatchersContaining extends jest.Matchers<void, any> {}
}
