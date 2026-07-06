import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import ModalBodyParagraphs from '../ModalBodyParagraphs'

describe('ModalBodyParagraphs (integration)', () => {
  it('renders each line as a paragraph', () => {
    render(
      <ModalBodyParagraphs lines={['First line', 'Header:', 'Second line']} />
    )

    expect(screen.getByText('First line')).toBeTruthy()
    expect(screen.getByText('Header:')).toBeTruthy()
    expect(screen.getByText('Second line')).toBeTruthy()
  })

  it('styles header lines ending with colon', () => {
    render(<ModalBodyParagraphs lines={['Section:']} />)

    const header = screen.getByText('Section:')
    expect(header.style.fontWeight).toBe('bold')
    expect(header.style.fontStyle).toBe('italic')
  })

  it('uses normal styling for non-header lines', () => {
    render(<ModalBodyParagraphs lines={['Plain text']} />)

    const line = screen.getByText('Plain text')
    expect(line.style.fontWeight).toBe('normal')
    expect(line.style.fontStyle).toBe('normal')
  })
})
