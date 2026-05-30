import { renderHook } from '@testing-library/react'
import type { MutableRefObject } from 'react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

import type { Repr } from '@reprman/types'
import { useReprsListAnimation } from './useReprsListAnimation'

const repr = (id: string): Repr => ({
  id,
  title: id,
  categories: [],
  dateCreated: 0,
  datesPracticed: [],
  comment: '',
  learning: false,
})

const defaultMatchMedia = globalThis.matchMedia

describe('useReprsListAnimation', () => {
  beforeEach(() => {
    globalThis.matchMedia = defaultMatchMedia
    HTMLElement.prototype.animate = vi.fn().mockReturnValue({
      onfinish: null,
      cancel: vi.fn(),
    }) as unknown as typeof HTMLElement.prototype.animate
  })

  afterEach(() => {
    globalThis.matchMedia = defaultMatchMedia
    delete (HTMLElement.prototype as { animate?: unknown }).animate
  })

  it('returns a container ref', () => {
    const { result } = renderHook(() => useReprsListAnimation([repr('a')]))
    expect(result.current.containerRef).toBeDefined()
    expect(result.current.containerRef.current).toBeNull()
  })

  it('skips animation when reduced motion is preferred', () => {
    globalThis.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('reduce'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    const { result, rerender } = renderHook(() =>
      useReprsListAnimation([repr('a')])
    )
    const container = document.createElement('div')
    const row = document.createElement('div')
    row.dataset.rowId = 'a'
    let top = 10
    Object.defineProperty(row, 'getBoundingClientRect', {
      value: () => ({ top }),
    })
    container.appendChild(row)
    ;(
      result.current.containerRef as MutableRefObject<HTMLDivElement | null>
    ).current = container
    rerender()
    top = 50
    rerender()

    expect(HTMLElement.prototype.animate).not.toHaveBeenCalled()
  })

  it('animates row movement when positions change', () => {
    const { result, rerender } = renderHook(
      ({ reprs }) => useReprsListAnimation(reprs),
      { initialProps: { reprs: [repr('a')] } }
    )

    const container = document.createElement('div')
    const row = document.createElement('div')
    row.dataset.rowId = 'a'
    let top = 10
    Object.defineProperty(row, 'getBoundingClientRect', {
      value: () => ({ top }),
    })
    container.appendChild(row)
    ;(
      result.current.containerRef as MutableRefObject<HTMLDivElement | null>
    ).current = container

    rerender({ reprs: [repr('a')] })
    top = 50
    rerender({ reprs: [repr('a')] })

    expect(HTMLElement.prototype.animate).toHaveBeenCalled()
  })
})
