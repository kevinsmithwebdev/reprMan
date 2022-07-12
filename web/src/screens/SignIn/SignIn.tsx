import React from 'react'
import AuthModule from 'modules/auth/auth.module'
import { withAuthenticator, Button, Heading } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import userEvent from '@testing-library/user-event'
import { Auth } from '@aws-amplify/auth'

const SignIn = (props: any) => {
  const { user, signOut } = props
  console.log('asdf Auth', Auth)
  return (
    <>
      <Heading level={1}>
        Hello,
        {user?.attributes?.email}
      </Heading>
      <Button onClick={signOut}>Sign out</Button>
    </>
  )
}

export default withAuthenticator(SignIn)
