import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { TERMS_VERSION } from '@reprman/constants'
import { renderWithAppShell } from '../../../test-utils'
import Signup from '../Signup'

const acceptTerms = vi.fn().mockResolvedValue(undefined)
let signUpOptions: { recordTermsAcceptance?: () => Promise<void> } = {}

vi.mock('@reprman/cognito-auth/configureAmplify', async (importOriginal) => {
  const actual = await importOriginal<
    typeof import('@reprman/cognito-auth/configureAmplify')
  >()
  return {
    ...actual,
    isCognitoConfigured: () => true,
    homeAuthGateActive: () => true,
  }
})

vi.mock('@reprman/cognito-auth/useCognitoSignUp', () => ({
  useCognitoSignUp: (
    _onSuccess: () => void,
    options?: { recordTermsAcceptance?: () => Promise<void> }
  ) => {
    signUpOptions = options ?? {}
    return {
      step: 'register',
      email: '',
      setEmail: vi.fn(),
      password: '',
      setPassword: vi.fn(),
      confirmPassword: '',
      setConfirmPassword: vi.fn(),
      code: '',
      setCode: vi.fn(),
      busy: false,
      setStep: vi.fn(),
      handleRegister: vi.fn(),
      handleConfirm: vi.fn(),
      handleResend: vi.fn(),
    }
  },
}))

vi.mock('@reprman/reprs-api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@reprman/reprs-api')>()
  return {
    ...actual,
    isReprsApiConfigured: true,
    ReprsApiModule: {
      getInstance: () => ({ acceptTerms }),
    },
  }
})

describe('Signup reprs API (integration)', () => {
  it('records terms acceptance when reprs API is configured', async () => {
    acceptTerms.mockClear()
    renderWithAppShell(<Signup />, { initialEntries: ['/signup'] })
    expect(signUpOptions.recordTermsAcceptance).toBeTypeOf('function')
    await signUpOptions.recordTermsAcceptance?.()
    expect(acceptTerms).toHaveBeenCalledWith(TERMS_VERSION)
  })
})
