import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import 'bootstrap/dist/css/bootstrap.min.css'
import { CognitoAuthProvider, configureAmplify } from '@reprman/cognito-auth'
import store from '@reprman/state/store'

import App from './App'
import { LogBuildInfoOnMount } from './LogBuildInfoOnMount'
import './index.css'

configureAmplify()

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element #root not found')
}
const root = ReactDOM.createRoot(rootElement)

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
