import AddReprButton from 'components/AddReprButton'
import React, { FC } from 'react'
import { Badge, Dropdown } from 'react-bootstrap'
import { FilterCircle } from 'react-bootstrap-icons'
import { useL10n } from 'modules/Localization'
import { useCategories } from 'state/categories'
import { useReprs } from 'state/reprs'
import { CategoryFilter, Reprs } from 'types'
import { getDoesContainsAll } from 'utilities'
import FilterForm from './FilterForm'

interface ControlsProps {
  shouldShow: boolean
}

const Controls: FC<ControlsProps> = ({ shouldShow }) => {
  const { t } = useL10n()
  const { reprs } = useReprs()
  const { filter } = useCategories()

  if (!shouldShow) {
    return null
  }

  const numFilters = +!!filter.text + filter.categories.length
  const numText = numFilters > 9 ? '9+' : numFilters
  const numFiltersText = numFilters ? `${numText}` : ''
  const filteredReprs = getFilteredReprs(reprs, filter)

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        padding: '5px 20px',
        backgroundColor: '#444',
        width: '100%',
        marginTop: '-20px',
        boxShadow: '0 3px 3px rgba(64,64, 64, 0.5)',
      }}
      id="controls-component"
    >
      <AddReprButton />
      <span style={{ color: '#d0d0d0', fontWeight: 600 }}>
        {t('components.reprsList.reprsCountShort', {
          count: filteredReprs.length,
        })}
      </span>
      <Dropdown id="filter-button">
        <Dropdown.Toggle style={{ display: 'flex', alignItems: 'center' }}>
          <FilterCircle size={20} style={{ marginRight: '10px' }} />
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
                left: '25px',
                width: '20px',
                height: '20px',
                letterSpacing: numFilters > 9 ? '-0.1em' : 'normal',
              }}
            >
              {numFiltersText}
            </Badge>
          )}
          Filter
        </Dropdown.Toggle>
        <Dropdown.Menu style={{ padding: '5px' }}>
          <FilterForm />
        </Dropdown.Menu>
      </Dropdown>
    </div>
  )
}

export default Controls

const getFilteredReprs = (reprs: Reprs, filter: CategoryFilter) =>
  reprs.filter((r) => {
    const shouldPassForText = r.title
      .toLowerCase()
      .includes(filter.text.toLowerCase())

    const shouldCheckCategories = !!filter.categories.length
    const shouldPassForCategories =
      !shouldCheckCategories ||
      getDoesContainsAll(r.categories, filter.categories)

    return shouldPassForText && shouldPassForCategories
  })
