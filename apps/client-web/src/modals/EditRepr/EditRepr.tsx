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
import {
  addCategory,
  addPillCategory,
  findFormErrors,
  ReprForm,
  ReprFormErrors,
  removeCategory,
} from './EditRepr.helpers'

export interface EditReprProps {
  closeModal: () => void
  id?: string
}

const EditRepr: FC<EditReprProps> = ({ closeModal, id }) => {
  const { t } = useL10n()
  const { categories: availableCategories } = useCategories()
  const [enteredCategory, setEnteredCategory] = useState('')
  const { getRepr, reprs } = useReprs()
  const repr = getRepr(id)
  const isCreateMode = !id
  const initialCategories = repr.categories || []
  const initialTitle = repr.title ?? ''
  const initialComment = repr.comment ?? ''
  const [categories, setCategories] = useState<string[]>(initialCategories)

  const [form, setForm] = useState<ReprForm>({
    title: initialTitle,
    categoryInput: '',
    comment: initialComment,
  })
  const [errors, setErrors] = useState<ReprFormErrors>({})

  const isTitleValid = form.title.length >= 1
  const categoriesDirty =
    categories.length !== initialCategories.length ||
    categories.some((category, index) => category !== initialCategories[index])
  const isDirty =
    form.title !== initialTitle ||
    form.comment !== initialComment ||
    categoriesDirty
  const disableSave = !isTitleValid || (!isCreateMode && !isDirty)

  const setField = (field: string, value: string) => {
    setForm({
      ...form,
      [field]: value,
    })
  }

  const categoriesComplement = getComplement(availableCategories, categories)

  if (reprs.length >= MAX_FREE_REPRS) {
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
        <Modal.Title>
          {isCreateMode
            ? t('modals.editRepr.createTitle')
            : t('modals.editRepr.title')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label style={{ fontWeight: 800 }}>
              {t('pages.viewRepr.data.title')}:
            </Form.Label>
            <Form.Control
              id="edit-repr-title-input"
              type="title"
              placeholder={t('modals.editRepr.enterTitlePlaceholder')}
              value={form.title}
              onChange={({ target: { value } }) => setField('title', value)}
              isInvalid={!!errors.title}
              autoFocus
              required
            />
            <Form.Control.Feedback type="invalid">
              {errors.title}
            </Form.Control.Feedback>
          </Form.Group>

          <hr />

          <Form.Group className="mb-3">
            <Form.Label style={{ fontWeight: 800 }}>
              {t('pages.viewRepr.data.categories')}:
            </Form.Label>
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
              {categories?.length ? (
                categories.map((c) => (
                  <CategoryLine
                    key={c}
                    category={c}
                    removeCategory={(value) =>
                      removeCategory(value, categories, setCategories)
                    }
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
                    onClick={(category) =>
                      addPillCategory(category, categories, setCategories)
                    }
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
                  style={{
                    border: errors.categoryInput ? '1px solid #c00' : '',
                  }}
                  onChange={({ target: { value } }) =>
                    setEnteredCategory(value)
                  }
                  onKeyPress={({ key }) => {
                    if (key === 'Enter') {
                      addCategory({
                        form,
                        setErrors,
                        categories,
                        setCategories,
                        enteredCategory,
                        setEnteredCategory,
                      })
                    }
                  }}
                />

                <Button
                  variant="success"
                  size="sm"
                  style={{}}
                  onClick={() =>
                    addCategory({
                      form,
                      setErrors,
                      categories,
                      setCategories,
                      enteredCategory,
                      setEnteredCategory,
                    })
                  }
                >
                  +
                </Button>
              </div>
              {!!errors.categoryInput && (
                <p style={{ color: '#c11', fontSize: '14px' }}>
                  {errors.categoryInput}
                </p>
              )}
            </div>
          </Form.Group>

          <hr />

          <Form.Group className="mb-3">
            <Form.Label style={{ fontWeight: 800 }}>
              {t('pages.viewRepr.data.comment')}:
            </Form.Label>
            <Form.Control
              type="title"
              placeholder={t('modals.editRepr.enterCommentPlaceholder')}
              value={form.comment}
              onChange={({ target: { value } }) => setField('comment', value)}
              isInvalid={!!errors.comment}
            />
            <Form.Control.Feedback type="invalid">
              {errors.comment}
            </Form.Control.Feedback>
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
          disabled={disableSave}
          onClick={() => {
            const foundErrors = findFormErrors({
              form,
              categories,
              enteredCategory,
            })

            if (Object.keys(foundErrors).length > 0) {
              setErrors(foundErrors)
            } else {
              const thisRepr = {
                id: repr.id || '',
                title: form.title,
                categories,
                dateCreated: repr.dateCreated || NaN,
                datesPracticed: repr.datesPracticed || ([] as number[]),
                comment: form.comment,
              } as Repr
              store.dispatch(addReprSAC(thisRepr))
              closeModal()
            }
          }}
        >
          {t('buttons.save')}
        </Button>
      </Modal.Footer>
    </div>
  )
}

export default EditRepr
