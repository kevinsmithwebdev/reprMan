import React, { FC } from 'react'
import { Badge } from 'react-bootstrap'
import { Categories } from 'types'

export interface CategoryPillsProps {
  categories: Categories
  onClick: (c: string) => void
}

const CategoryPills: FC<CategoryPillsProps> = ({ categories, onClick }) => (
  <div>
    {categories.map((c: string) => (
      <Badge
        pill
        key={c}
        style={{
          padding: '5px',
          paddingBottom: '7px',
          margin: '5px',
          backgroundColor: 'red',
        }}
        onClick={() => onClick(c)}
      >
        {c}
      </Badge>
    ))}
  </div>
)

export default CategoryPills
