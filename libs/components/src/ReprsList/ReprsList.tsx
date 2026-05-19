import React, { FC, useLayoutEffect, useMemo, useRef } from 'react'
import Repr from '@reprman/components/ReprLine'
import { ReprStatus } from '@reprman/components/ReprLine/ReprLine.helpers'
import { useL10n } from '@reprman/localization'
import { useSettings } from '@reprman/state/settings'
import { groupReprsByStatus } from './ReprsList.helpers'
import { ReprsListProps } from './ReprsList.types'

const SECTION_TITLE_KEYS: Record<ReprStatus, string> = {
  [ReprStatus.OVERDUE]: 'components.reprsList.sectionOverdue',
  [ReprStatus.WARNING]: 'components.reprsList.sectionWarning',
  [ReprStatus.UP_TO_DATE]: 'components.reprsList.sectionUpToDate',
}

const SECONDS_PER_SCREEN = 0.5

const ReprsList: FC<ReprsListProps> = ({ reprs }) => {
  const { t } = useL10n()
  const { settings } = useSettings()
  const hasReprs = reprs.length > 0
  const sections = useMemo(
    () => groupReprsByStatus(reprs, settings),
    [reprs, settings]
  )
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
    <div
      id="reprs-list-component"
      className={
        hasReprs
          ? undefined
          : 'd-flex justify-content-center align-items-center text-center h-100'
      }
      style={
        hasReprs
          ? { display: 'flex', flexDirection: 'column', gap: '10px' }
          : undefined
      }
      ref={containerRef}
    >
      {!hasReprs ? (
        <p className="text-muted mb-0 px-3" role="status">
          {t('components.reprsList.emptyList')}
        </p>
      ) : null}
      {hasReprs &&
        sections.map((section, sectionIndex) => (
          <section
            key={section.status}
            aria-labelledby={`reprs-section-${section.status}`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              marginTop: sectionIndex > 0 ? '16px' : undefined,
            }}
          >
            <h2
              id={`reprs-section-${section.status}`}
              className="h6 text-muted fw-bold mb-0 text-center mx-auto px-1 w-100"
              style={{ maxWidth: 800 }}
            >
              {t(SECTION_TITLE_KEYS[section.status])}
            </h2>
            {section.reprs.map((r) => (
              <div key={r.id} data-row-id={r.id}>
                <Repr repr={r} />
              </div>
            ))}
          </section>
        ))}
    </div>
  )
}

export default ReprsList
