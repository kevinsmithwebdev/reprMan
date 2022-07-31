import React from 'react'
import { useL10n } from 'modules/Localization'
import { COPYRIGHT_YEAR, MY_EMAIL } from 'constants/index'

const Footer = () => {
  const { t } = useL10n()

  return (
    <footer
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '40px',
        backgroundColor: '#222',
        color: '#ddd',
        position: 'sticky',
        width: '100%',
        bottom: 0,
      }}
      id="footer-component"
    >
      {`${t('brand.copyright', {
        year: COPYRIGHT_YEAR,
      })}  -  ${MY_EMAIL}`}
    </footer>
  )
}

export default Footer
