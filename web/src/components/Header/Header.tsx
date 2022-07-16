import React from 'react'
import { Container, Navbar } from 'react-bootstrap'
import Menu from './Menu'

const Header = () => {
  // FIXME: performance?
  const helpText = 'Welcome'

  return (
    <Navbar bg="dark" expand={false} className="mb-3" variant="dark">
      <Container fluid>
        <Navbar.Brand href="#">ReprMan - Repertoire Management</Navbar.Brand>
        <div className="row-1">{helpText}</div>

        <Menu />
      </Container>
    </Navbar>
  )
}

export default Header
