'use client'

import { useAuthGate } from '@reprman/cognito-auth'
import { CenteredSpinner } from '@reprman/components'
import { useL10n } from '@reprman/localization'
import { makeToastSAC } from '@reprman/state/sagas/toast/toast.actions'
import { useReprs } from '@reprman/state/reprs'
import { ToastLevel } from '@reprman/types'
import React, { useCallback, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import {
  collectSortedUniqueCategories,
  filterReprsByLabels,
  formatReprReportLine,
  formatReportsClipboardText,
  sortReprsByTitle,
} from './Reports/Reports.helpers'
import ReportsControls from './Reports/ReportsControls'
import { useReplaceWhen } from '../hooks/useReplaceWhen'

const ReportsView = () => {
  const { t } = useL10n()
  const dispatch = useDispatch()
  const { reprs, reprsLoaded } = useReprs()
  const { isLoading, isSignedOut } = useAuthGate()

  useReplaceWhen(isSignedOut && !isLoading, '/signin')

  const [selectedLabels, setSelectedLabels] = useState<string[]>([])
  const [includeComments, setIncludeComments] = useState(false)
  const [includeLabels, setIncludeLabels] = useState(false)

  const allCategories = useMemo(
    () => collectSortedUniqueCategories(reprs),
    [reprs]
  )

  const visibleReprs = useMemo(() => {
    const filtered = filterReprsByLabels(reprs, selectedLabels)
    return sortReprsByTitle(filtered)
  }, [reprs, selectedLabels])

  const toggleLabel = useCallback((category: string) => {
    setSelectedLabels((prev) => {
      const i = prev.indexOf(category)
      if (i === -1) {
        return [...prev, category]
      }
      const next = prev.slice()
      next.splice(i, 1)
      return next
    })
  }, [])

  const handleCopy = useCallback(async () => {
    const text = formatReportsClipboardText(
      visibleReprs,
      includeComments,
      includeLabels
    )
    try {
      await navigator.clipboard.writeText(text)
      dispatch(
        makeToastSAC({
          body: t('pages.reports.copySuccess'),
          level: ToastLevel.SUCCESS,
          delay: 4000,
        })
      )
    } catch {
      dispatch(
        makeToastSAC({
          body: t('pages.reports.copyFail'),
          level: ToastLevel.FAIL,
          delay: 6000,
        })
      )
    }
  }, [dispatch, includeComments, includeLabels, t, visibleReprs])

  if (isLoading) {
    return <CenteredSpinner id="Reports-page" layout="fill" />
  }

  if (isSignedOut) {
    return null
  }

  if (!reprsLoaded) {
    return <CenteredSpinner id="Reports-page" layout="fill" />
  }

  return (
    <div id="Reports-page" className="app-route-page-fill">
      <div className="app-route-toolbar app-scroll-full-bleed">
        <ReportsControls
          allCategories={allCategories}
          selectedLabels={selectedLabels}
          onToggleLabel={toggleLabel}
          includeComments={includeComments}
          onIncludeCommentsChange={setIncludeComments}
          includeLabels={includeLabels}
          onIncludeLabelsChange={setIncludeLabels}
          onCopy={handleCopy}
        />
      </div>
      <div className="app-route-scroll-host app-scroll-full-bleed">
        <div className="app-route-scroll">
          <div className="app-route-scroll-inner">
            {visibleReprs.length === 0 ? (
              <p className="text-muted mb-0">
                {reprs.length === 0
                  ? t('components.reprsList.emptyList')
                  : t('pages.reports.emptyFiltered')}
              </p>
            ) : (
              <div>
                {visibleReprs.map((r) => (
                  <div
                    key={r.id}
                    style={{ fontSize: '0.95rem', lineHeight: 1.35 }}
                  >
                    {formatReprReportLine(r, includeComments, includeLabels)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportsView
