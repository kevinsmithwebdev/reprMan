import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { renderWithAppShell } from '../../../../apps/client-web/src/test-utils'
import CognitoAuthBar from '../CognitoAuthBar'

vi.mock('@reprman/localization', () => ({
  useL10n: () => ({ t: (key: string) => key }),
}))

describe('CognitoAuthBar unconfigured (integration)', () => {
  it('returns null when Cognito is not configured', () => {
    const { container } = renderWithAppShell(<CognitoAuthBar />)
    expect(container.firstChild).toBeNull()
  })
})
