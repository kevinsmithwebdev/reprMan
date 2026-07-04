import { createTranslator } from './translationBundles'

describe('createTranslator', () => {
  it('returns English strings and interpolates placeholders', () => {
    const t = createTranslator('en')
    expect(t('meta.description')).toBe(
      'ReprMan - Repertoire management web app'
    )
    expect(t('pages.about.suggestions', { email: 'a@b.c' })).toContain('a@b.c')
  })

  it('falls back to English for missing keys in another language bundle', () => {
    const t = createTranslator('en')
    expect(t('brand.reprMan')).toBe('ReprMan')
  })
})
