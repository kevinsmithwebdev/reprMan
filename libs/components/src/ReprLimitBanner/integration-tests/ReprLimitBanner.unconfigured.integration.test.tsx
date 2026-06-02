import { screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { testRepr } from '../../../../../apps/client-web/src/test-utils/fixtures'
import { renderWithAppShell } from '../../../../../apps/client-web/src/test-utils'
import ReprLimitBanner from '..'

vi.mock('@reprman/reprs-api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@reprman/reprs-api')>()
  return {
    ...actual,
    isReprsApiConfigured: false,
  }
})

describe('ReprLimitBanner unconfigured API (integration)', () => {
  it('renders nothing when the reprs API is not configured', () => {
    renderWithAppShell(<ReprLimitBanner />, {
      preloadedState: {
        reprs: [testRepr(), testRepr({ id: 'r2' })],
        reprsQuota: {
          subscription: {
            status: 'unpaid',
            expiration: null,
            maxReprs: 2,
          },
          maxReprsAllowed: 2,
        },
      },
    })

    expect(screen.queryByRole('alert')).toBeNull()
  })
})
