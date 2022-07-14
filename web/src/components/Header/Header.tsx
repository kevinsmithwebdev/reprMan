import React from 'react'
import { Container, Navbar } from 'react-bootstrap'
import { useUser } from 'state/user'
import Menu from './Menu'

const Header = () => {
  const { user } = useUser()
  const refer = user.name || user.email

  // FIXME: performance?
  const helpText = refer
    ? `Welcome, ${refer}`
    : 'Please sign in or create an account.'

  return (
    <Navbar bg="dark" expand={false} className="mb-3" variant="dark">
      <Container fluid>
        <Navbar.Brand href="#">Repr - Repertoire Management</Navbar.Brand>
        <div className="row-1">{helpText}</div>

        <Menu />
      </Container>
    </Navbar>
  )
}

export default Header
