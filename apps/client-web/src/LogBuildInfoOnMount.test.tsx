import React from 'react'
import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { LogBuildInfoOnMount } from './LogBuildInfoOnMount'

describe('LogBuildInfoOnMount', () => {
  it('logs build metadata once on mount', () => {
    const logSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    render(
      <React.StrictMode>
        <LogBuildInfoOnMount />
      </React.StrictMode>
    )

    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(logSpy.mock.calls[0][0]).toBe('[reprman] build')
    expect(logSpy.mock.calls[0][1]).toEqual({
      version: import.meta.env.VITE_VERSION,
      buildNumber: import.meta.env.VITE_BUILD_NUMBER,
      buildTimeUtc: import.meta.env.VITE_BUILD_TIME_UTC,
      gitSha: import.meta.env.VITE_GIT_SHA,
    })
    logSpy.mockRestore()
  })
})
