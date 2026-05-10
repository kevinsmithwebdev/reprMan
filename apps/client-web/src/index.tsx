import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import 'bootstrap/dist/css/bootstrap.min.css'
import { CognitoAuthProvider, configureAmplify } from '@reprman/cognito-auth'
import store from '@reprman/state/store'

import App from './App'
import './index.css'

configureAmplify()

const LogBuildInfoOnMount = () => {
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

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <CognitoAuthProvider>
          <LogBuildInfoOnMount />
          <App />
        </CognitoAuthProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
)
