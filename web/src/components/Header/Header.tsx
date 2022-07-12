import { Auth } from 'aws-amplify'
import React from 'react'
import { Button, Container, Navbar, Offcanvas } from 'react-bootstrap'
import { NavLink, useNavigate } from 'react-router-dom'
import { useUser } from 'state/user'

const Header = () => {
  const { user } = useUser()
  const navigate = useNavigate()
  const hasUser = !!user.email
  const refer = user.name || user.email

  // FIXME: performance
  const helpText = refer
    ? `Welcome, ${refer}`
    : 'Please sign in or create an account.'

  const signText = hasUser ? 'Sign Out' : 'Sign In'
  const signAction = hasUser
    ? () => Auth.signOut()
    : () => navigate('/', { replace: true })

  return (
    <Navbar bg="dark" expand={false} className="mb-3" variant="dark">
      <Container fluid>
        <Navbar.Brand href="#">Repr - Repertoire Management</Navbar.Brand>
        <div className="row-1">{helpText}</div>
        <Navbar.Toggle />
        <Navbar.Offcanvas placement="end">
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Menu</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <NavLink to="/">Home</NavLink>
            <NavLink to="/about">About</NavLink>
            <Button onClick={signAction}>{signText}</Button>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  )
}

export default Header
