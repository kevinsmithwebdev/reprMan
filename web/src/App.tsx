import React, { useEffect } from 'react'
import './App.css'
import Header from 'components/Header'
import { Routes, Route, Navigate } from 'react-router-dom'
import About from 'pages/About'
import ModalContainer from 'modals/ModalContainer'
import { runGenesisSaga } from 'state/sagas/genesis/genesis.actions'
import store from 'state/store'
import ViewRepr from 'pages/ViewRepr'
import Home from './pages/Home'

const App = () => {
  useEffect(() => {
    store.dispatch(runGenesisSaga())
  })

  return (
    <>
      <Header />
      <Routes>
        <Route path="/view/:id" element={<ViewRepr />} />
        <Route path="/about" element={<About />} />
        <Route path="/" element={<Home />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <ModalContainer />
    </>
  )
}

export default App
