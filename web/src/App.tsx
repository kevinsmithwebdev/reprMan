import React from 'react'
import { Hub } from 'aws-amplify'
import './App.css'
import Header from 'components/Header'
import { Routes, Route } from 'react-router-dom'
import SignIn from 'screens/SignIn'
import About from 'screens/About'
import RequireAuth from 'modules/auth/RequireAuth'
import { listenToAuth } from 'App.helpers'
import Home from './screens/Home'

Hub.listen('auth', listenToAuth)

const App = () => {
  return (
    <>
      <Header />
      <Routes>
        <Route
          path="/"
          element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          }
        />
        <Route path="/about" element={<About />} />
        <Route path="/signin" element={<SignIn />} />
      </Routes>
    </>
  )
}

export default App
