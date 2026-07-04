import { ControlsBarShell } from '@reprman/components'
import { useL10n } from '@reprman/localization'
;('use client')

import React, { FC } from 'react'
import { Button, Form } from 'react-bootstrap'
import { Clipboard2PlusFill } from 'react-bootstrap-icons'

export interface ReportsControlsProps {
  allCategories: string[]
  selectedLabels: string[]
  onToggleLabel: (category: string) => void
  includeComments: boolean
  onIncludeCommentsChange: (checked: boolean) => void
  includeLabels: boolean
  onIncludeLabelsChange: (checked: boolean) => void
  onCopy: () => void
}

const ReportsControls: FC<ReportsControlsProps> = ({
  allCategories,
  selectedLabels,
  onToggleLabel,
  includeComments,
  onIncludeCommentsChange,
  includeLabels,
  onIncludeLabelsChange,
  onCopy,
}) => {
  const { t } = useL10n()

  const copyLabel = t('pages.reports.copyToClipboard')

  const thirdColumn = { flex: '1 1 0', minWidth: 0 } as const
  const sectionTitleStyle = { color: '#d0d0d0' } as const
  const contentsRowBase =
    'd-flex flex-row flex-wrap align-items-center gap-2 gap-md-3'

  return (
    <ControlsBarShell
      id="reports-controls-component"
      variant="reportsWrap"
      className="text-light"
    >
      <div
        className="d-flex flex-wrap align-items-stretch w-100"
        style={{ gap: '12px' }}
      >
        <div
          className="d-flex flex-column align-items-start"
          style={thirdColumn}
        >
          <div className="fw-semibold small mb-2" style={sectionTitleStyle}>
            {t('pages.reports.filterByLabel')}
          </div>
          {allCategories.length === 0 ? (
            <span className="small" style={{ color: '#a8a8a8' }}>
              —
            </span>
          ) : (
            <Form.Group
              className={`${contentsRowBase} small w-100 justify-content-start`}
              style={{ maxHeight: 140, overflowY: 'auto' }}
            >
              {allCategories.map((category) => (
                <Form.Check
                  key={category}
                  id={`reports-label-${category}`}
                  type="checkbox"
                  checked={selectedLabels.includes(category)}
                  onChange={() => onToggleLabel(category)}
                  label={category}
                  className="small text-light"
                />
              ))}
            </Form.Group>
          )}
        </div>

        <div
          className="d-flex flex-column align-items-center"
          style={thirdColumn}
        >
          <div
            className="fw-semibold small mb-2 w-100 text-center"
            style={sectionTitleStyle}
          >
            {t('pages.reports.contentHeading')}
          </div>
          <div className={`${contentsRowBase} w-100 justify-content-center`}>
            <Form.Check
              id="reports-include-comments"
              type="checkbox"
              checked={includeComments}
              onChange={(e) => onIncludeCommentsChange(e.target.checked)}
              label={t('pages.reports.contentComments')}
              className="small text-light mb-0"
            />
            <Form.Check
              id="reports-include-labels"
              type="checkbox"
              checked={includeLabels}
              onChange={(e) => onIncludeLabelsChange(e.target.checked)}
              label={t('pages.reports.contentLabels')}
              className="small text-light mb-0"
            />
          </div>
        </div>

        <div className="d-flex flex-column align-items-end" style={thirdColumn}>
          <div
            className="fw-semibold small mb-2 w-100 text-end"
            style={sectionTitleStyle}
          >
            {t('pages.reports.exportHeading')}
          </div>
          <div className={`${contentsRowBase} w-100 justify-content-end`}>
            <Button
              variant="light"
              className="border-0 shadow-none"
              size="sm"
              type="button"
              onClick={onCopy}
              aria-label={copyLabel}
              title={copyLabel}
              style={{
                backgroundColor: '#d8d8d8',
                color: '#333',
              }}
            >
              <Clipboard2PlusFill size={18} aria-hidden />
            </Button>
          </div>
        </div>
      </div>
    </ControlsBarShell>
  )
}

export default ReportsControls
