import React, { useMemo } from 'react'
import { Dropdown } from 'react-bootstrap'
import { useL10n, type SupportedLanguage } from '@reprman/localization'

import './LanguageSwitcher.css'

const FLAG_SRC: Record<SupportedLanguage, string> = {
  en: '/static/flags/gb.svg',
  es: '/static/flags/es.svg',
  pt: '/static/flags/pt.svg',
}

const LANGUAGE_OPTIONS: SupportedLanguage[] = ['en', 'es', 'pt']

const LanguageFlag = ({
  language,
  alt,
  className,
}: {
  language: SupportedLanguage
  alt: string
  className?: string
}) => (
  <img
    src={FLAG_SRC[language]}
    alt={alt}
    className={className}
    width={24}
    height={16}
    loading="lazy"
    decoding="async"
  />
)

const LanguageSwitcher = () => {
  const { t, language, changeLanguage } = useL10n()

  const currentLanguage = useMemo(
    () =>
      LANGUAGE_OPTIONS.find((option) => language.startsWith(option)) ?? 'en',
    [language]
  )

  return (
    <Dropdown
      align="end"
      className="header-language-switcher"
      id="header-language-switcher"
    >
      <Dropdown.Toggle
        variant="link"
        bsPrefix="btn"
        className="header-language-toggle text-decoration-none text-white p-1 d-flex align-items-center"
        id="header-language-toggle"
        aria-label={t('language.switcherLabel')}
      >
        <LanguageFlag
          language={currentLanguage}
          alt={t(`language.flagAlt.${currentLanguage}`)}
          className="header-language-flag header-language-flag--current"
        />
      </Dropdown.Toggle>
      <Dropdown.Menu
        className="header-language-menu"
        popperConfig={{ strategy: 'fixed' }}
      >
        {LANGUAGE_OPTIONS.map((option) => (
          <Dropdown.Item
            key={option}
            active={currentLanguage === option}
            onClick={() => changeLanguage(option)}
            className="header-language-item d-flex align-items-center gap-2"
            id={`language-option-${option}`}
          >
            <LanguageFlag
              language={option}
              alt={t(`language.flagAlt.${option}`)}
              className="header-language-flag header-language-flag--menu"
            />
            <span>{t(`language.names.${option}`)}</span>
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  )
}

export default LanguageSwitcher
