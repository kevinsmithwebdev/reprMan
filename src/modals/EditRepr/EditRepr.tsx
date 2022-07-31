import React, { FC, useState } from 'react'
import { getComplement } from 'utilities'
import { Form } from 'react-bootstrap'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import { Repr, useReprs } from 'state/reprs'
import store from 'state/store'
import { addReprSAC } from 'state/sagas/reprs/reprs.actions'
import { useCategories } from 'state/categories'
import CategoryPills from 'components/CategoryPills'
import { MAX_FREE_REPRS } from 'constants/index'
import { useL10n } from 'modules/Localization'
import CategoryLine from './CategoryLine'

export interface EditReprProps {
  closeModal: () => void
  id: string
}

const EditRepr: FC<EditReprProps> = ({ closeModal, id }) => {
  const { t } = useL10n()
  const { categories: availableCategories } = useCategories()
  const [enteredCategory, setEnteredCategory] = useState('')
  const { getRepr, reprs } = useReprs()

  const repr = getRepr(id)
  const numReprs = reprs.length

  const [title, setTitle] = useState(repr.title || '')
  const [categories, setCategories] = useState(
    repr.categories || ([] as string[])
  )
  const [comment, setComment] = useState(repr.comment || '')

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

    if (index !== -1) return

    setCategories([...categories, category])
  }

  const categoriesComplement = getComplement(availableCategories, categories)

  if (numReprs >= MAX_FREE_REPRS) {
    return (
      <>
        <Modal.Header closeButton>
          <Modal.Title>{t('modals.editRepr.exceeded.title')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {t('modals.editRepr.exceeded.body', { num: MAX_FREE_REPRS })}
        </Modal.Body>
      </>
    )
  }

  return (
    <div id="edit-repr-modal">
      <Modal.Header closeButton>
        <Modal.Title>{t('modals.editReprs.title')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label style={{ fontWeight: 800 }}>Title:</Form.Label>
            <Form.Control
              id="edit-repr-title-input"
              type="title"
              placeholder={t('modals.editRepr.enterTitlePlaceholder')}
              value={title}
              onChange={({ target: { value } }) => setTitle(value)}
            />
          </Form.Group>

          <hr />

          <Form.Group className="mb-3">
            <Form.Label style={{ fontWeight: 800 }}>Categories:</Form.Label>
            <br />
            <div style={{ paddingLeft: '10px' }}>
              <Form.Label
                style={{
                  fontWeight: 600,
                  fontStyle: 'italic',
                }}
              >
                {t('modals.editRepr.current')}:
              </Form.Label>
              {categories.length ? (
                categories.map((c) => (
                  <CategoryLine
                    key={c}
                    category={c}
                    removeCategory={removeCategory}
                  />
                ))
              ) : (
                <Form.Text
                  className="text-muted"
                  style={{ paddingLeft: '10px' }}
                >
                  {t('modals.editRepr.noCategoriesSelected')}:
                </Form.Text>
              )}

              {!!categoriesComplement.length && (
                <>
                  <br />
                  <Form.Label style={{ fontWeight: 600, fontStyle: 'italic' }}>
                    {t('modals.editRepr.available')}:
                  </Form.Label>
                  <CategoryPills
                    categories={categoriesComplement}
                    onClick={addPillCategory}
                  />
                </>
              )}

              <br />

              <Form.Label style={{ fontWeight: 600, fontStyle: 'italic' }}>
                {t('modals.editRepr.addNewCategory')}:
              </Form.Label>
              <div
                style={{
                  width: '300px',
                  display: 'flex',
                  marginTop: '10px',
                }}
              >
                <Form.Control
                  value={enteredCategory}
                  type="newCategory"
                  placeholder={t('modals.editRepr.enterCategoryPlaceholder')}
                  style={{}}
                  onChange={({ target: { value } }) =>
                    setEnteredCategory(value)
                  }
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
            </div>
          </Form.Group>

          <hr />

          <Form.Group className="mb-3">
            <Form.Label style={{ fontWeight: 800 }}>Comment:</Form.Label>
            <Form.Control
              type="title"
              placeholder={t('modals.editRepr.enterCommentPlaceholder')}
              value={comment}
              onChange={({ target: { value } }) => setComment(value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer style={{ display: 'flex', justifyContent: 'space-around' }}>
        <Button
          variant="danger"
          onClick={closeModal}
          style={{ flex: 1, maxWidth: '200px' }}
        >
          {t('buttons.closeWithoutSave')}
        </Button>
        <Button
          id="edit-repr-save-button"
          style={{ flex: 1, maxWidth: '200px' }}
          variant="success"
          onClick={() => {
            const thisRepr = {
              id: repr.id || '',
              title,
              categories,
              dateCreated: repr.dateCreated || NaN,
              datesPracticed: repr.datesPracticed || ([] as number[]),
              comment,
            } as Repr
            store.dispatch(addReprSAC(thisRepr))
            closeModal()
          }}
        >
          {t('buttons.save')}
        </Button>
      </Modal.Footer>
    </div>
  )
}

export default EditRepr
