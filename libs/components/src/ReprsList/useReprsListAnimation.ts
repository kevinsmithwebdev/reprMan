import { type RefObject, useLayoutEffect, useRef } from 'react'
import { Repr } from '@reprman/types'

const SECONDS_PER_SCREEN = 0.5
const ROW_SELECTOR = '[data-row-id]'

export interface UseReprsListAnimationResult {
  containerRef: RefObject<HTMLDivElement | null>
}

/**
 * FLIP-style row animations when repr order/sections change.
 * Attach `containerRef` to the list root; rows need `data-row-id={repr.id}`.
 */
export const useReprsListAnimation = (
  reprs: Repr[]
): UseReprsListAnimationResult => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const previousTopsRef = useRef(new Map<string, number>())
  const activeAnimationsRef = useRef(new Map<string, Animation>())

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    const nodes =
      containerRef.current?.querySelectorAll<HTMLDivElement>(ROW_SELECTOR) || []
    const currentIds = new Set<string>()

    nodes.forEach((node) => {
      const id = node.dataset.rowId
      if (!id) return
      currentIds.add(id)

      const previousTop = previousTopsRef.current.get(id)
      const currentTop = node.getBoundingClientRect().top

      if (previousTop !== undefined) {
        const deltaY = previousTop - currentTop
        if (deltaY !== 0) {
          const existingAnimation = activeAnimationsRef.current.get(id)
          if (existingAnimation) existingAnimation.cancel()

          const durationMs = prefersReducedMotion
            ? 0
            : (Math.abs(deltaY) / window.innerHeight) *
              SECONDS_PER_SCREEN *
              1000

          if (durationMs > 0) {
            const animation = node.animate(
              [
                { transform: `translateY(${deltaY}px)` },
                { transform: 'translateY(0px)' },
              ],
              {
                duration: durationMs,
                easing: 'ease-in-out',
                fill: 'both',
              }
            )
            activeAnimationsRef.current.set(id, animation)
            animation.onfinish = () => {
              if (activeAnimationsRef.current.get(id) === animation) {
                activeAnimationsRef.current.delete(id)
              }
            }
          }
        }
      }

      previousTopsRef.current.set(id, currentTop)
    })

    previousTopsRef.current.forEach((_top, id) => {
      if (currentIds.has(id)) return

      previousTopsRef.current.delete(id)
      const animation = activeAnimationsRef.current.get(id)
      if (animation) {
        animation.cancel()
        activeAnimationsRef.current.delete(id)
      }
    })
  }, [reprs])

  return { containerRef }
}
