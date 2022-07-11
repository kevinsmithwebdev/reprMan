import React from 'react'
import './App.css'
import Home from './screens/Home'
import Header from 'components/Header'
import {Routes, Route} from 'react-router-dom'
import SignIn from 'screens/SignIn'
import {useUser} from 'state/user'
import AuthProvider, {RequireAuth} from 'auth/AuthProvider'
import About from 'screens/About'

const App = () => {
  const {user} = useUser()
  const isSignedIn = !!user.email
  console.log('asdf user', isSignedIn, user)

  return (
    <AuthProvider>
      <Header />
      <Routes>
        <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
        <Route path="/about" element={<About />} />
        <Route path="/signin" element={<SignIn />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
