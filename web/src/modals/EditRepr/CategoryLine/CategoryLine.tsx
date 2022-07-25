import React, { FC } from 'react'
import { Button, Form } from 'react-bootstrap'

interface CategoryLineProps {
  category: string
  removeCategory: (value: string) => void
}

const CategoryLine: FC<CategoryLineProps> = ({ category, removeCategory }) => {
  return (
    <Form.Text
      key={category}
      style={{
        display: 'flex',
        width: '180px',
        justifyContent: 'space-between',
        backgroundColor: '#eee',
        paddingLeft: '5px',
        borderRadius: '2px',
      }}
    >
      {category}{' '}
      <Button
        variant="danger"
        size="sm"
        style={{ padding: '0 5px' }}
        onClick={() => removeCategory(category)}
      >
        X
      </Button>
    </Form.Text>
  )
}

export default CategoryLine
