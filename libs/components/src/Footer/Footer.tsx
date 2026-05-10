import React from 'react'
import { useL10n } from '@reprman/localization'
import { COPYRIGHT_YEAR, MY_EMAIL } from '@reprman/constants'

const Footer = () => {
  const { t } = useL10n()

  return (
    <footer
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '40px',
        padding: '8px 12px',
        backgroundColor: '#222',
        color: '#ddd',
        position: 'sticky',
        width: '100%',
        bottom: 0,
        textAlign: 'center',
        flexWrap: 'wrap',
        gap: '4px',
      }}
      id="footer-component"
    >
      <span>
        {`${t('brand.copyright', {
          year: COPYRIGHT_YEAR,
        })}  -  ${MY_EMAIL}`}
      </span>
    </footer>
  )
}

export default Footer
