import React from 'react'
import { withAuthenticator, Button } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'

const Signing = (props: any) => {
  const { signOut } = props

  return <Button onClick={signOut}>Sign Out</Button>
}

export default withAuthenticator(Signing)
