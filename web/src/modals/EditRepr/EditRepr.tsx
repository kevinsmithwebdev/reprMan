import { getComplement } from 'helpers'
import React, { FC, useState } from 'react'
import { Badge, Form } from 'react-bootstrap'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import { addRepr, Repr, useReprs } from 'state/reprs'
import store from 'state/store'
import CategoryLine from './CategoryLine'

interface EditReprProps {
  closeModal: () => void
}

const EditRepr: FC<EditReprProps> = ({ closeModal }) => {
  const { categories: availableCategories } = useReprs()
  const [enteredCategory, setEnteredCategory] = useState('')

  const [title, setTitle] = useState('')
  const [categories, setCategories] = useState([] as string[])
  const [comment, setComment] = useState('')

  const removeCategory = (value: string) => {
    setCategories(categories.filter((c) => c !== value))
  }

  const addCategory = () => {
    const index = categories.findIndex((c) => c === enteredCategory)

    if (!enteredCategory || index !== -1) {
      return
    }

    setCategories([...categories, enteredCategory])
    setEnteredCategory('')
  }

  const addPillCategory = (category: string) => {
    const index = categories.findIndex((c) => c === category)

    if (index !== -1) {
      return
    }

    setCategories([...categories, category])
  }

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>Edit Repr</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label style={{ fontWeight: 800 }}>Title:</Form.Label>
            <Form.Control
              type="title"
              placeholder="Enter title"
              value={title}
              onChange={({ target: { value } }) => setTitle(value)}
            />
          </Form.Group>

          <hr />

          <Form.Group className="mb-3">
            <Form.Label style={{ fontWeight: 800 }}>Categories:</Form.Label>
            <br />
            {categories.length ? (
              categories.map((c) => (
                <CategoryLine
                  key={c}
                  category={c}
                  removeCategory={removeCategory}
                />
              ))
            ) : (
              <Form.Text className="text-muted">
                No categories selected.
              </Form.Text>
            )}
            <br />
            <br />

            <div>
              {getComplement(availableCategories, categories).map((c) => (
                <Badge
                  pill
                  bg="secondary"
                  key={c}
                  style={{ padding: '5px', margin: '5px' }}
                  onClick={() => addPillCategory(c)}
                >
                  {c}
                </Badge>
              ))}
            </div>

            <Form.Label style={{ fontWeight: 600, paddingLeft: '5px' }} l>
              New Category:
            </Form.Label>
            <div
              style={{
                width: '300px',
                backgroundColor: 'pink',
                display: 'flex',
                marginTop: '10px',
              }}
            >
              <Form.Control
                value={enteredCategory}
                type="newCategory"
                placeholder="Enter new category"
                style={{}}
                onChange={({ target: { value } }) => setEnteredCategory(value)}
                onKeyPress={({ key }) => {
                  if (key === 'Enter') {
                    addCategory()
                  }
                }}
              />
              <Button
                variant="success"
                size="sm"
                style={{}}
                onClick={addCategory}
              >
                +
              </Button>
            </div>
          </Form.Group>

          <hr />

          <Form.Group className="mb-3">
            <Form.Label style={{ fontWeight: 800 }}>Comment:</Form.Label>
            <Form.Control
              type="title"
              placeholder="Enter comment"
              value={comment}
              onChange={({ target: { value } }) => setComment(value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={closeModal}>
          Close without Save
        </Button>
        <Button
          variant="success"
          onClick={() => {
            const thisRepr = {
              id: '',
              title,
              categories,
              dateCreated: 0,
              datesPracticed: [] as number[],
              comment,
            } as Repr
            store.dispatch(addRepr(thisRepr))
            closeModal()
          }}
        >
          Save
        </Button>
      </Modal.Footer>
    </>
  )
}

export default EditRepr
