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

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <CognitoAuthProvider>
          <App />
        </CognitoAuthProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
)
