import React, { useState } from 'react'
import { Button, Navbar, Offcanvas } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { clearAllReprsSAC } from 'state/sagas/reprs/reprs.actions'
import store from 'state/store'

const Menu = () => {
  const navigate = useNavigate()
  const [shouldShow, setShouldShow] = useState(false)

  const handleNavClick = (path: string) => {
    setShouldShow(false)
    navigate(path)
  }

  const handleClearAll = () => {
    setShouldShow(false)
    store.dispatch(clearAllReprsSAC())
  }

  return (
    <>
      <Navbar.Toggle onClick={() => setShouldShow(true)} />
      <Navbar.Offcanvas placement="end" show={shouldShow}>
        <Offcanvas.Header closeButton onHide={() => setShouldShow(false)}>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body style={{ display: 'flex', flexDirection: 'column' }}>
          <Button style={{ margin: 10 }} onClick={() => handleNavClick('/')}>
            Home
          </Button>
          <Button style={{ margin: 10 }} onClick={handleClearAll}>
            Clear All Reprs
          </Button>
          <Button
            style={{ margin: 10 }}
            onClick={() => handleNavClick('/about')}
          >
            About
          </Button>
        </Offcanvas.Body>
      </Navbar.Offcanvas>
    </>
  )
}

export default Menu
