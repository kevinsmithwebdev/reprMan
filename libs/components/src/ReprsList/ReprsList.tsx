import React, { FC, useMemo } from 'react'
import { ReprStatus } from '@reprman/components/ReprLine/ReprLine.helpers'
import { useL10n } from '@reprman/localization'
import { useSettings } from '@reprman/state/settings'
import { groupReprsByStatus } from './ReprsList.helpers'
import ReprsListSection from './ReprsListSection'
import { ReprsListProps } from './ReprsList.types'
import { useReprsListAnimation } from './useReprsListAnimation'

const SECTION_TITLE_KEYS: Record<ReprStatus, string> = {
  [ReprStatus.LEARNING]: 'components.reprsList.sectionLearning',
  [ReprStatus.OVERDUE]: 'components.reprsList.sectionOverdue',
  [ReprStatus.WARNING]: 'components.reprsList.sectionWarning',
  [ReprStatus.UP_TO_DATE]: 'components.reprsList.sectionUpToDate',
}

const ReprsList: FC<ReprsListProps> = ({ reprs }) => {
  const { t } = useL10n()
  const { settings } = useSettings()
  const hasReprs = reprs.length > 0
  const sections = useMemo(
    () => groupReprsByStatus(reprs, settings),
    [reprs, settings]
  )

  const { containerRef } = useReprsListAnimation(reprs)

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
          <ReprsListSection
            key={section.status}
            sectionId={`reprs-section-${section.status}`}
            title={t(SECTION_TITLE_KEYS[section.status])}
            reprs={section.reprs}
            marginTop={sectionIndex > 0}
          />
        ))}
    </div>
  )
}

export default ReprsList
