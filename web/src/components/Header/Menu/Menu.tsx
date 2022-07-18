import React, { useState } from 'react'
import { Button, Navbar, Offcanvas } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

const Menu = () => {
  const navigate = useNavigate()
  const [shouldShow, setShouldShow] = useState(false)

  const handleClick = (path: string) => {
    setShouldShow(false)
    navigate(path)
  }

  return (
    <>
      <Navbar.Toggle onClick={() => setShouldShow(true)} />
      <Navbar.Offcanvas placement="end" show={shouldShow}>
        <Offcanvas.Header closeButton onHide={() => setShouldShow(false)}>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body style={{ display: 'flex', flexDirection: 'column' }}>
          <Button style={{ margin: 10 }} onClick={() => handleClick('/')}>
            Home
          </Button>
          <Button style={{ margin: 10 }} onClick={() => handleClick('/about')}>
            About
          </Button>
        </Offcanvas.Body>
      </Navbar.Offcanvas>
    </>
  )
}

export default Menu
