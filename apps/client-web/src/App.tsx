import React, { useEffect } from 'react'
import './App.css'
import Header from 'components/Header'
import { Routes, Route, Navigate } from 'react-router-dom'
import ModalContainer from 'modals/ModalContainer'
import { runGenesisSaga } from 'state/sagas/genesis/genesis.actions'
import store from 'state/store'
import Home from 'pages/Home'
import About from 'pages/About'
import Settings from 'pages/Settings'
import SignIn from 'pages/SignIn'
import Signup from 'pages/Signup'
import ForgotPassword from 'pages/ForgotPassword'
import ChangePassword from 'pages/ChangePassword'
import ViewRepr from 'pages/ViewRepr'
import Footer from 'components/Footer'
import ToastWrapper from 'components/ToastWrapper'

const App = () => {
  useEffect(() => {
    store.dispatch(runGenesisSaga())
  }, [])

  return (
    <main
      style={{
        display: 'flex',
        height: '100vh',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      id="home-page"
    >
      <Header />

      <div
        style={{
          flex: 1,
          padding: '120px 20px 20px',
          maxWidth: '1200px',
          minWidth: '400px',
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
