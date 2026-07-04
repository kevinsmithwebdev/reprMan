import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { homeAuthGateActive } from '@reprman/cognito-auth/configureAmplify'
import { CognitoAuthBar } from '@reprman/cognito-auth'
import { useCognitoAuth } from '@reprman/cognito-auth/CognitoAuthContext'
import { useL10n } from '@reprman/localization'
import { Nav, Navbar } from 'react-bootstrap'
import SubscriptionHeaderStatus from '../SubscriptionHeaderStatus/SubscriptionHeaderStatus'
import LanguageSwitcher from './LanguageSwitcher'

import './Header.css'

interface RouteData {
  name: string
  path: string
}

/** L10n key for the page segment appended to the navbar brand (not on Home). */
function pageTitleKeyForPath(pathname: string): string | null {
  if (pathname === '/' || pathname === '') {
    return null
  }
  if (pathname.startsWith('/reports')) {
    return 'pages.reports.title'
  }
  if (pathname.startsWith('/about')) {
    return 'pages.about.title'
  }
  if (pathname.startsWith('/terms')) {
    return 'pages.terms.title'
  }
  if (pathname.startsWith('/settings')) {
    return 'pages.settings.title'
  }
  if (pathname.startsWith('/subscribe')) {
    return 'pages.subscribe.title'
  }
  if (pathname.startsWith('/view')) {
    return 'pages.viewRepr.title'
  }
  if (pathname.startsWith('/signin')) {
    return 'pages.signin.title'
  }
  if (pathname.startsWith('/signup')) {
    return 'pages.signup.title'
  }
  if (pathname.startsWith('/forgot-password')) {
    return 'pages.forgotPassword.title'
  }
  if (pathname.startsWith('/change-password')) {
    return 'pages.changePassword.title'
  }
  return null
}

/** Below 1000px viewport width, omit "Repertoire Management" from the navbar brand. */
const HEADER_BRAND_NARROW_MQ = '(max-width: 999px)'

export const initialNarrowBrand = (): boolean =>
  globalThis.window?.matchMedia(HEADER_BRAND_NARROW_MQ).matches ?? false

const Header = () => {
  const pathname = usePathname()
  const rootPath = `/${pathname.split('/')[1] || ''}`
  const { t, language } = useL10n()
  const { sessionChecked, signedIn } = useCognitoAuth()

  const [narrowBrand, setNarrowBrand] = useState(initialNarrowBrand)

  useEffect(() => {
    const mq = globalThis.window.matchMedia(HEADER_BRAND_NARROW_MQ)
    const sync = () => setNarrowBrand(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const brandBase = useMemo(() => {
    const name = t('brand.reprMan')
    if (narrowBrand) {
      return name
    }
    return `${name} - ${t('brand.repertoireManagement')}`
  }, [narrowBrand, language, t])

  const navbarBrandLabel = useMemo(() => {
    const pageKey = pageTitleKeyForPath(pathname)
    return pageKey ? `${brandBase} - ${t(pageKey)}` : brandBase
  }, [brandBase, pathname, language, t])

  useEffect(() => {
    document.title = navbarBrandLabel
  }, [navbarBrandLabel])

  const routes = [
    { name: t('pages.home.title'), path: '/' },
    { name: t('pages.about.title'), path: '/about' },
    { name: t('pages.settings.title'), path: '/settings' },
  ] as RouteData[]

  const settingsNavDisabled =
    homeAuthGateActive() && sessionChecked && !signedIn

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
        className="mb-0 header-navbar"
        variant="dark"
      >
        <div className="header-navbar-inner">
          <Navbar.Brand
            style={{ padding: '0 20px' }}
            href="/"
            id="header-brand"
          >
            {navbarBrandLabel}
          </Navbar.Brand>

          <div className="header-navbar-center" id="header-subscription-center">
            <SubscriptionHeaderStatus />
          </div>

          <div className="header-navbar-end">
            <Nav
              className="justify-content-end flex-row"
              style={{ padding: '0 14px' }}
              id="nav-links"
            >
              {routes.map((r) =>
                renderLink(r, rootPath, settingsNavDisabled, t)
              )}
            </Nav>
            <LanguageSwitcher />
            <CognitoAuthBar />
          </div>
        </div>
      </Navbar>
    </div>
  )
}

export default Header

const NavLink = ({
  href,
  className,
  children,
}: {
  href: string
  className: string
  children: React.ReactNode
}) => (
  <Link href={href} className={className}>
    {children}
  </Link>
)

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
        <NavLink href={route.path} className={className}>
          {route.name.toUpperCase()}
        </NavLink>
      )}
    </Nav.Item>
  )
}
