import React from 'react'
import './App.css'
import Header from 'components/Header'
import { Routes, Route } from 'react-router-dom'
import About from 'pages/About'
import ModalContainer from 'modals/ModalContainer'
import Home from './pages/Home'

const App = () => {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>

      <ModalContainer />
    </>
  )
}

export default App
