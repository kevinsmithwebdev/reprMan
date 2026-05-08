import React, { FC, useLayoutEffect, useRef } from 'react'
import Repr from 'components/ReprLine'
import { ReprsListProps } from './ReprsList.types'

const SECONDS_PER_SCREEN = 0.5

const ReprsList: FC<ReprsListProps> = ({ reprs }) => {
  const hasReprs = reprs.length > 0
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches
  const containerRef = useRef<HTMLDivElement | null>(null)
  const previousTopsRef = useRef(new Map<string, number>())
  const activeAnimationsRef = useRef(new Map<string, Animation>())

  useLayoutEffect(() => {
    const nodes =
      containerRef.current?.querySelectorAll<HTMLDivElement>('[data-row-id]') ||
      []
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
  }, [reprs, prefersReducedMotion])

  return (
    <div id="reprs-list-component" style={{ paddingTop: '8px' }} ref={containerRef}>
      {hasReprs &&
        reprs.map((r) => (
          <div key={r.id} data-row-id={r.id}>
            <Repr repr={r} />
          </div>
        ))}
    </div>
  )
}

export default ReprsList
