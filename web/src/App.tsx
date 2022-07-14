import React from 'react'
import { Hub } from 'aws-amplify'
import './App.css'
import Header from 'components/Header'
import { Routes, Route } from 'react-router-dom'
import Signing from 'pages/Signing'
import About from 'pages/About'
import RequireAuth from 'modules/auth/RequireAuth'
import { listenToAuth, useAuthLoading } from 'App.helpers'
import Home from './pages/Home'

Hub.listen('auth', listenToAuth)

const App = () => {
  const { isLoadingAuth } = useAuthLoading()

  if (isLoadingAuth) return null

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
        <Route path="/signing" element={<Signing />} />
      </Routes>
    </>
  )
}

export default App
