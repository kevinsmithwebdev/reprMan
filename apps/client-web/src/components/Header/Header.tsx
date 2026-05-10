import React from 'react'
import { homeAuthGateActive } from 'config/configureAmplify'
import { CognitoAuthBar } from 'modules/CognitoAuth'
import { useCognitoAuth } from 'modules/CognitoAuth/CognitoAuthContext'
import { useL10n } from 'modules/Localization'
import { Nav, Navbar } from 'react-bootstrap'
import { NavLink, useLocation } from 'react-router-dom'

import Controls from './Controls'
import './Header.css'

interface RouteData {
  name: string
  path: string
}

const Header = () => {
  const location = useLocation()
  const rootPath = `/${location.pathname.split('/')[1]}`
  const { t } = useL10n()
  const { sessionChecked, signedIn } = useCognitoAuth()

  const routes = [
    { name: t('pages.home.title'), path: '/' },
    { name: t('pages.about.title'), path: '/about' },
    { name: t('pages.settings.title'), path: '/settings' },
  ] as RouteData[]

  const settingsNavDisabled = homeAuthGateActive && sessionChecked && !signedIn
  const shouldShowControls =
    rootPath === '/' && (!homeAuthGateActive || signedIn)

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 999,
        width: '100%',
      }}
      id="header-component"
    >
      <Navbar
        id="Header"
        bg="dark"
        expand={false}
        className="mb-3"
        variant="dark"
      >
        <Navbar.Brand style={{ padding: '0 20px' }} href="/" id="header-brand">
          {`${t('brand.reprMan')} - ${t('brand.repertoireManagement')}`}
        </Navbar.Brand>

        <div
          className="ms-auto d-flex flex-row flex-wrap align-items-center"
          style={{ padding: '0 16px', gap: '8px' }}
        >
          <Nav
            className="justify-content-end flex-row"
            style={{ padding: '0 14px' }}
            id="nav-links"
          >
            {routes.map((r) => renderLink(r, rootPath, settingsNavDisabled, t))}
          </Nav>
          <CognitoAuthBar />
        </div>
      </Navbar>

      <Controls shouldShow={shouldShowControls} />
    </div>
  )
}

export default Header

const renderLink = (
  route: RouteData,
  rootPath: string,
  settingsNavDisabled: boolean,
  t: (key: string) => string
) => {
  const isCurrent = route.path === rootPath
  const isSettings = route.path === '/settings'
  const disabled = isSettings && settingsNavDisabled

  const className = isCurrent ? 'nav-link selected' : 'nav-link'
  return (
    <Nav.Item
      key={route.name}
      as="li"
      style={{ padding: '0 15px' }}
      id={`nav-link-${route.name}`}
    >
      {disabled ? (
        <span
          className={`${className} disabled`}
          aria-disabled="true"
          title={t('auth.settingsDisabledHint')}
        >
          {route.name.toUpperCase()}
        </span>
      ) : (
        <NavLink to={route.path} className={className}>
          {route.name.toUpperCase()}
        </NavLink>
      )}
    </Nav.Item>
  )
}
