import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getCurrentUser, fetchUserAttributes } = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  fetchUserAttributes: vi.fn(),
}))

vi.mock('aws-amplify/auth', () => ({
  getCurrentUser,
  fetchUserAttributes,
}))

import { userFromCognitoSession } from './cognitoSession'

describe('userFromCognitoSession', () => {
  beforeEach(() => {
    getCurrentUser.mockReset()
    fetchUserAttributes.mockReset()
  })

  it('maps Cognito session to User', async () => {
    getCurrentUser.mockResolvedValue({
      userId: 'user-sub',
      signInDetails: { loginId: 'login@example.com' },
    })
    fetchUserAttributes.mockResolvedValue({
      email: 'user@example.com',
      name: 'Jane Doe',
      given_name: 'Jane',
    })

    await expect(userFromCognitoSession()).resolves.toEqual({
      email: 'user@example.com',
      name: 'Jane Doe',
      userId: 'user-sub',
    })
  })

  it('falls back to loginId and given_name when email and name are missing', async () => {
    getCurrentUser.mockResolvedValue({
      userId: 'user-sub',
      signInDetails: { loginId: 'login@example.com' },
    })
    fetchUserAttributes.mockResolvedValue({ given_name: 'Pat' })

    await expect(userFromCognitoSession()).resolves.toEqual({
      email: 'login@example.com',
      name: 'Pat',
      userId: 'user-sub',
    })
  })

  it('returns null when Cognito is unavailable', async () => {
    getCurrentUser.mockRejectedValue(new Error('not signed in'))

    await expect(userFromCognitoSession()).resolves.toBeNull()
  })
})
