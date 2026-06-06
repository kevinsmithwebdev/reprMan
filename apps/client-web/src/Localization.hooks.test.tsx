import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useL10n } from '@reprman/localization'
import i18next from '@reprman/localization/setupI18n'

describe('useL10n', () => {
  it('returns updated translations when the language changes', async () => {
    await i18next.changeLanguage('en')

    const { result } = renderHook(() => useL10n())
    const tBefore = result.current.t

    expect(result.current.t('pages.home.title')).toBe('Home')

    await act(async () => {
      await i18next.changeLanguage('es')
    })

    expect(result.current.language).toMatch(/^es/)
    expect(result.current.t('pages.home.title')).toBe('Inicio')
    expect(result.current.t).not.toBe(tBefore)

    await i18next.changeLanguage('en')
  })
})
