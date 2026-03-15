import AddReprButton from 'components/AddReprButton'
import React, { FC } from 'react'
import { Badge, Dropdown } from 'react-bootstrap'
import { FilterCircle } from 'react-bootstrap-icons'
import { useCategories } from 'state/categories'
import FilterForm from './FilterForm'

interface ControlsProps {
  shouldShow: boolean
}

const Controls: FC<ControlsProps> = ({ shouldShow }) => {
  const { filter } = useCategories()

  if (!shouldShow) {
    return null
  }

  const numFilters = +!!filter.text + filter.categories.length
  const numText = numFilters > 9 ? '9+' : numFilters
  const numFiltersText = numFilters ? `${numText}` : ''

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
