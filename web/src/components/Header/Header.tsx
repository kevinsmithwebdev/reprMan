import React from 'react'
import { Nav, Navbar } from 'react-bootstrap'
import { useLocation } from 'react-router-dom'

interface RouteData {
  name: string
  path: string
}

const routes = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Settings', path: '/settings' },
] as RouteData[]

const Header = () => {
  const location = useLocation()
  const rootPath = `/${location.pathname.split('/')[1]}`

  return (
    <Navbar bg="dark" expand={false} className="mb-3" variant="dark">
      <Navbar.Brand style={{ padding: '0 20px' }} href="/">
        ReprMan - Repertoire Management
      </Navbar.Brand>

      <Nav
        activeKey={rootPath}
        className="justify-content-end flex-row"
        style={{ padding: '0 30px' }}
      >
        {routes.map(renderLink)}
      </Nav>
    </Navbar>
  )
}

export default Header

const renderLink = (route: RouteData) => (
  <Nav.Item key={route.name} as="li" style={{ padding: '0 15px' }}>
    <Nav.Link href={route.path}>{route.name.toUpperCase()}</Nav.Link>
  </Nav.Item>
)
