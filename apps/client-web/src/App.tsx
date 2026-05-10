import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Header from '@reprman/components/Header'
import Footer from '@reprman/components/Footer'
import ToastWrapper from '@reprman/components/ToastWrapper'
import ModalContainer from '@reprman/modals/ModalContainer'
import store from '@reprman/state/store'
import { runGenesisSaga } from '@reprman/state/sagas/genesis/genesis.actions'

import './App.css'
import Home from './pages/Home'
import About from './pages/About'
import Settings from './pages/Settings'
import SignIn from './pages/SignIn'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import ChangePassword from './pages/ChangePassword'
import ViewRepr from './pages/ViewRepr'

const App = () => {
  useEffect(() => {
    store.dispatch(runGenesisSaga())
  }, [])

  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
      id="home-page"
    >
      <Header />

      <div
        className="app-content-container"
        style={{
          flex: 1,
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <Routes>
          <Route path="/view/:id" element={<ViewRepr />} />
          <Route path="/about" element={<About />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/change-password" element={<ChangePassword />} />

          <Route path="/" element={<Home />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        <ModalContainer />
      </div>

      <ToastWrapper />

      <Footer />
    </main>
  )
}

export default App
