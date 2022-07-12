import React from 'react'
import { Card } from 'react-bootstrap'
import { useUser } from 'state/user'

const Header = () => {
  const { user } = useUser()
  console.log('asdf name', user.name)
  return (
    <Card text="light" className="mb-2" bg="success">
      <Card.Body>
        <Card.Title>Repr - Repertoire Management</Card.Title>
        <Card.Subtitle>{`Welcome, ${user.name}`}</Card.Subtitle>
      </Card.Body>
    </Card>
  )
}

export default Header
