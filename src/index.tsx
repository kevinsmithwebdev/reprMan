import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { createBrowserHistory } from 'history'

import './index.css'
import App from './App'
import reportWebVitals from './reportWebVitals'
import 'bootstrap/dist/css/bootstrap.min.css'
import store from './state/store'

const history = createBrowserHistory()
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

if (root) {
  // eslint-disable-next-line no-restricted-globals
  const path = (/#!(\/.*)$/.exec(location.hash) || [])[1]

  if (path) {
    history.replace(path)
  }

  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </React.StrictMode>
  )
}

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
)

reportWebVitals()
