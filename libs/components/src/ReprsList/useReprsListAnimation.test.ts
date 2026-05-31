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

  it('clears active animation when onfinish runs for the current animation', () => {
    const mockAnimation = {
      onfinish: null as (() => void) | null,
      cancel: vi.fn(),
    }
    HTMLElement.prototype.animate = vi.fn().mockReturnValue(mockAnimation)

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

    expect(mockAnimation.onfinish).toEqual(expect.any(Function))
    mockAnimation.onfinish?.()
  })

  it('ignores rows without a data-row-id', () => {
    const { result, rerender } = renderHook(
      ({ reprs }) => useReprsListAnimation(reprs),
      { initialProps: { reprs: [repr('a')] } }
    )

    const container = document.createElement('div')
    const row = document.createElement('div')
    row.dataset.rowId = 'a'
    const rowMissingId = document.createElement('div')
    rowMissingId.setAttribute('data-row-id', '')
    let top = 10
    Object.defineProperty(row, 'getBoundingClientRect', {
      value: () => ({ top }),
    })
    container.append(row, rowMissingId)
    ;(
      result.current.containerRef as MutableRefObject<HTMLDivElement | null>
    ).current = container

    rerender({ reprs: [repr('a')] })
    top = 50
    rerender({ reprs: [repr('a')] })

    expect(HTMLElement.prototype.animate).toHaveBeenCalledTimes(1)
  })

  it('cancels an in-flight animation before starting a new one', () => {
    const cancel = vi.fn()
    const mockAnimation = { onfinish: null, cancel }
    HTMLElement.prototype.animate = vi.fn().mockReturnValue(mockAnimation)

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
    top = 90
    rerender({ reprs: [repr('a')] })

    expect(cancel).toHaveBeenCalled()
    expect(HTMLElement.prototype.animate).toHaveBeenCalledTimes(2)
  })

  it('cancels active animation when a row is removed from the list', () => {
    const cancel = vi.fn()
    const mockAnimation = { onfinish: null, cancel }
    HTMLElement.prototype.animate = vi.fn().mockReturnValue(mockAnimation)

    const { result, rerender } = renderHook(
      ({ reprs }) => useReprsListAnimation(reprs),
      { initialProps: { reprs: [repr('a'), repr('b')] } }
    )

    const container = document.createElement('div')
    const rowA = document.createElement('div')
    rowA.dataset.rowId = 'a'
    const rowB = document.createElement('div')
    rowB.dataset.rowId = 'b'
    let topA = 10
    let topB = 60
    Object.defineProperty(rowA, 'getBoundingClientRect', {
      value: () => ({ top: topA }),
    })
    Object.defineProperty(rowB, 'getBoundingClientRect', {
      value: () => ({ top: topB }),
    })
    container.append(rowA, rowB)
    ;(
      result.current.containerRef as MutableRefObject<HTMLDivElement | null>
    ).current = container

    rerender({ reprs: [repr('a'), repr('b')] })
    topA = 20
    topB = 100
    rerender({ reprs: [repr('a'), repr('b')] })

    container.removeChild(rowB)
    rerender({ reprs: [repr('a')] })

    expect(cancel).toHaveBeenCalled()
  })
})
