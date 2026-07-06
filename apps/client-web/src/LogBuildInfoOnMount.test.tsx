import { render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { LogBuildInfoOnMount } from './LogBuildInfoOnMount'

describe('LogBuildInfoOnMount', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('logs build metadata once on mount', () => {
    vi.stubEnv('NEXT_PUBLIC_VERSION', '2.0.0')
    vi.stubEnv('NEXT_PUBLIC_BUILD_NUMBER', '42')
    vi.stubEnv('NEXT_PUBLIC_BUILD_TIME_UTC', '2024-01-01T00:00:00Z')
    vi.stubEnv('NEXT_PUBLIC_GIT_SHA', 'abc123')
    const infoSpy = vi
      .spyOn(console, 'info')
      .mockImplementation(() => undefined)

    const { rerender } = render(<LogBuildInfoOnMount />)
    rerender(<LogBuildInfoOnMount />)

    expect(infoSpy).toHaveBeenCalledTimes(1)
    expect(infoSpy).toHaveBeenCalledWith('[reprman] build', {
      version: '2.0.0',
      buildNumber: '42',
      buildTimeUtc: '2024-01-01T00:00:00Z',
      gitSha: 'abc123',
    })
  })
})
