import React from 'react'
import AuthModule from 'modules/auth/auth.module'

const SignIn = () => {
  console.log('SignIn AuthM', AuthModule)
  return (
    <>
      <h2>You need to sign into the app.</h2>
      <button onClick={() => AuthModule.signIn(() => console.log('auth callback'))}>Sign In</button>
    </>
  )
}

export default SignIn
