'use client'

import React from 'react'

export const LogBuildInfoOnMount = () => {
  const didLog = React.useRef(false)
  React.useEffect(() => {
    if (didLog.current) {
      return
    }
    didLog.current = true
    console.info('[reprman] build', {
      version: process.env.NEXT_PUBLIC_VERSION,
      buildNumber: process.env.NEXT_PUBLIC_BUILD_NUMBER,
      buildTimeUtc: process.env.NEXT_PUBLIC_BUILD_TIME_UTC,
      gitSha: process.env.NEXT_PUBLIC_GIT_SHA,
    })
  }, [])
  return null
}
