import React from 'react'

export const LogBuildInfoOnMount = () => {
  const didLog = React.useRef(false)
  React.useEffect(() => {
    if (didLog.current) {
      return
    }
    didLog.current = true
    console.info('[reprman] build', {
      version: import.meta.env.VITE_VERSION,
      buildNumber: import.meta.env.VITE_BUILD_NUMBER,
      buildTimeUtc: import.meta.env.VITE_BUILD_TIME_UTC,
      gitSha: import.meta.env.VITE_GIT_SHA,
    })
  }, [])
  return null
}
