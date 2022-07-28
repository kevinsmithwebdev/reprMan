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
    margin: '5px',
    fontSize: '12px',
  },
  [CategoryPillSize.MEDIUM]: {
    padding: '6px',
    paddingBottom: '8px',
    margin: '6px',
    fontSize: '14px',
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
  const aggregateStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    ...containerStyle,
  }

  return (
    <div style={aggregateStyle}>
      {categories.map((c: string) => (
        <Badge pill key={c} style={pillStyle[size]} onClick={() => onClick(c)}>
          {c}
        </Badge>
      ))}
    </div>
  )
}

export default CategoryPills
