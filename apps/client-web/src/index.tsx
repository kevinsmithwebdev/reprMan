import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import 'bootstrap/dist/css/bootstrap.min.css'

import { configureAmplify } from 'config/configureAmplify'
import { CognitoAuthProvider } from 'modules/CognitoAuth/CognitoAuthContext'

import App from './App'
import './index.css'
import reportWebVitals from './reportWebVitals'
import store from './state/store'

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

reportWebVitals()
