import React from 'react'
import { useL10n } from 'modules/Localization'
import { Nav, Navbar } from 'react-bootstrap'
import { NavLink, useLocation } from 'react-router-dom'
import './Header.css'
import Controls from './Controls'

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

  const shouldShowControls = rootPath === '/'

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 999,
        width: '100%',
      }}
    >
      <Navbar
        id="Header"
        bg="dark"
        expand={false}
        className="mb-3"
        variant="dark"
      >
        <Navbar.Brand style={{ padding: '0 20px' }} href="/">
          {`${t('brand.reprMan')} - ${t('brand.repertoireManagement')}`}
        </Navbar.Brand>

        <Nav
          className="justify-content-end flex-row"
          style={{ padding: '0 30px' }}
        >
          {routes.map((r) => renderLink(r, rootPath))}
        </Nav>
      </Navbar>

      <Controls shouldShow={shouldShowControls} />
    </div>
  )
}

export default Header

const renderLink = (route: RouteData, rootPath: string) => {
  const isCurrent = route.path === rootPath

  const className = isCurrent ? 'nav-link selected' : 'nav-link'
  return (
    <Nav.Item key={route.name} as="li" style={{ padding: '0 15px' }}>
      <NavLink to={route.path} className={className}>
        {route.name.toUpperCase()}
      </NavLink>
    </Nav.Item>
  )
}
