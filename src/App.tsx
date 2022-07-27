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
import ViewRepr from 'pages/ViewRepr'
import Footer from 'components/Footer'

const App = () => {
  useEffect(() => {
    store.dispatch(runGenesisSaga())
  })

  return (
    <main
      style={{
        display: 'flex',
        minHeight: '100vh',
        flexDirection: 'column',
      }}
    >
      <Header />

      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/view/:id" element={<ViewRepr />} />
          <Route path="/about" element={<About />} />
          <Route path="/settings" element={<Settings />} />

          <Route path="/" element={<Home />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        <ModalContainer />
      </div>

      <Footer />
    </main>
  )
}

export default App
