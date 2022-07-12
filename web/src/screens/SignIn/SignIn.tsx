import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { withAuthenticator, Button, Heading } from '@aws-amplify/ui-react'

import '@aws-amplify/ui-react/styles.css'

const SignIn = (props: any) => {
  const { user, signOut } = props
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate()

  useEffect(() => {
    if (user.attributes.email) {
      console.log('asdf ********* should redirect')
      navigate('/about', { replace: true })
    }
  }, [user.attributes.email])

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
