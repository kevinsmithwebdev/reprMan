import AddReprButton from '@reprman/components/AddReprButton'
import React, { FC } from 'react'
import Link from 'next/link'
import { Badge, Dropdown } from 'react-bootstrap'
import { FileEarmarkBarGraph, FilterCircle } from 'react-bootstrap-icons'
import { useL10n } from '@reprman/localization'
import { useCategories } from '@reprman/state/categories'
import { useReprs } from '@reprman/state/reprs'
import { getFilteredReprs } from '@reprman/utilities'
import CategoryFilterTextInput from './CategoryFilterTextInput'
import ControlsBarShell from './ControlsBarShell'
import FilterForm from './FilterForm'

const ControlsHome: FC = () => {
  const { t } = useL10n()
  const { reprs } = useReprs()
  const { filter } = useCategories()

  const numFilters = +!!filter.text + filter.categories.length
  const numText = numFilters > 9 ? '9+' : numFilters
  const numFiltersText = numFilters ? `${numText}` : ''
  const filteredReprs = getFilteredReprs(reprs, filter)

  return (
    <ControlsBarShell id="controls-home-component" variant="homeRow">
      <AddReprButton />
      <span style={{ color: '#d0d0d0', fontWeight: 600 }}>
        {t('components.reprsList.reprsCountShort', {
          count: filteredReprs.length,
        })}
      </span>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <CategoryFilterTextInput style={{ maxWidth: 220, minWidth: 140 }} />
        <Dropdown id="filter-button">
          <Dropdown.Toggle
            aria-label={t('components.categoryFilter.openMenuAriaLabel')}
            style={{
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            <FilterCircle size={20} aria-hidden />
            {!!numFiltersText && (
              <Badge
                pill
                bg="warning"
                text="dark"
                style={{
                  display: 'flex',
                  position: 'absolute',
                  justifyContent: 'center',
                  alignItems: 'center',
                  top: '2px',
                  left: '22px',
                  width: '20px',
                  height: '20px',
                  letterSpacing: numFilters > 9 ? '-0.1em' : 'normal',
                }}
              >
                {numFiltersText}
              </Badge>
            )}
          </Dropdown.Toggle>
          <Dropdown.Menu style={{ padding: '5px' }}>
            <FilterForm />
          </Dropdown.Menu>
        </Dropdown>
        <Link
          href="/reports"
          title={t('components.controls.reportsPageTitle')}
          aria-label={t('components.controls.reportsPageAriaLabel')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 34,
            height: 34,
            borderRadius: 8,
            backgroundColor: '#ea580c',
            color: '#fff',
            lineHeight: 1,
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          <FileEarmarkBarGraph size={20} aria-hidden />
        </Link>
      </div>
    </ControlsBarShell>
  )
}

export default ControlsHome
