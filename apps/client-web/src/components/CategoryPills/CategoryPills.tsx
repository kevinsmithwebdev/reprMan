import React, { CSSProperties, FC } from 'react'
import { Badge } from 'react-bootstrap'
import { Categories } from 'types'

export enum CategoryPillSize {
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
}

const pillStyle = {
  [CategoryPillSize.SMALL]: {
    padding: '5px',
    paddingBottom: '7px',
    margin: '2.5px',
    fontSize: '12px',
    fontWeight: '500',
    backgroundColor: '#0c63e4',
    borderRadius: '6px',
  },
  [CategoryPillSize.MEDIUM]: {
    padding: '6px',
    paddingBottom: '8px',
    margin: '3px',
    fontSize: '14px',
    backgroundColor: '#0c63e4',
    borderRadius: '6px',
  },
}

export interface CategoryPillsProps {
  categories: Categories
  onClick?: (c: string) => void
  containerStyle?: CSSProperties
  size?: CategoryPillSize
}

const CategoryPills: FC<CategoryPillsProps> = ({
  categories,
  onClick = () => {},
  containerStyle,
  size = CategoryPillSize.SMALL,
}) => {
  const sortedCategories = [...categories].sort((a, b) => a.localeCompare(b))

  const aggregateStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    ...containerStyle,
  }

  return (
    <div style={aggregateStyle}>
      {sortedCategories.map((c: string) => (
        <Badge key={c} style={pillStyle[size]} onClick={() => onClick(c)}>
          {c}
        </Badge>
      ))}
    </div>
  )
}

export default CategoryPills
