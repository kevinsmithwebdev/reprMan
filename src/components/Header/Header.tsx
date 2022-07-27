import React from 'react'
import { useL10n } from 'modules/Localization'
import { Nav, Navbar } from 'react-bootstrap'
import { useLocation } from 'react-router-dom'

interface RouteData {
  name: string
  path: string
}

const Header = () => {
  const location = useLocation()
  const rootPath = `/${location.pathname.split('/')[1]}`
  const { t } = useL10n()

  const routes = [
    { name: t('pages.home.title'), path: '/' },
    { name: t('pages.about.title'), path: '/about' },
    { name: t('pages.settings.title'), path: '/settings' },
  ] as RouteData[]

  return (
    <Navbar
      bg="dark"
      expand={false}
      className="mb-3"
      variant="dark"
      style={{ position: 'sticky', top: 0 }}
    >
      <Navbar.Brand style={{ padding: '0 20px' }} href="/">
        {`${t('brand.reprMan')} - ${t('brand.repertoireManagement')}`}
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
