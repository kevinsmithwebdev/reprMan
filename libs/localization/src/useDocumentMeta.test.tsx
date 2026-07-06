import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useDocumentMeta } from './useDocumentMeta'

const MetaProbe = () => {
  useDocumentMeta()
  return null
}

describe('useDocumentMeta', () => {
  it('updates description and noscript content from translations', () => {
    document.head.innerHTML =
      '<meta name="description" content="old"><noscript>old</noscript>'

    render(<MetaProbe />)

    const description = document.querySelector('meta[name="description"]')
    const noscript = document.querySelector('noscript')

    expect(description?.getAttribute('content')).toBeTruthy()
    expect(noscript?.textContent).toBeTruthy()
    expect(description?.getAttribute('content')).not.toBe('old')
    expect(noscript?.textContent).not.toBe('old')
  })
})
