import { FILE_LINE_DELIMITER } from '@reprman/constants'

export interface ReprForm {
  title: string
  categoryInput: string
  comment: string
  learning: boolean
}

export type ReprFormErrors = Partial<ReprForm>

type TranslateFn = (key: string) => string

export const findFormErrors = ({
  form,
  categories,
  enteredCategory,
  t,
}: {
  form: ReprForm
  categories: string[]
  enteredCategory: string
  t: TranslateFn
}) => {
  const { title, comment, categoryInput } = form
  const newErrors = {} as ReprFormErrors

  if (!title) newErrors.title = t('validation.required')
  if (title?.includes(FILE_LINE_DELIMITER))
    newErrors.title = t('validation.noAsterisk')

  const indexExistingCategories = categories.indexOf(enteredCategory)

  if (indexExistingCategories !== -1)
    newErrors.categoryInput = appendError(
      newErrors.categoryInput,
      t('validation.categoryExists')
    )

  if (enteredCategory.includes(FILE_LINE_DELIMITER))
    newErrors.categoryInput = appendError(
      newErrors.categoryInput,
      t('validation.noAsterisk')
    )

  if (comment?.includes(FILE_LINE_DELIMITER))
    newErrors.comment = appendError(
      newErrors.comment,
      t('validation.noAsterisk')
    )

  if (categoryInput.includes(FILE_LINE_DELIMITER))
    newErrors.categoryInput = appendError(
      newErrors.categoryInput,
      t('validation.noAsterisk')
    )

  return newErrors
}

const appendError = (originalError: string | undefined, newError: string) =>
  originalError ? ` ${newError}` : newError

export const removeCategory = (
  value: string,
  categories: string[],
  setCategories: Function
) => setCategories(categories.filter((c) => c !== value))

export const addCategory = ({
  form,
  setErrors,
  categories,
  setCategories,
  enteredCategory,
  setEnteredCategory,
  t,
}: {
  form: ReprForm
  setErrors: Function
  categories: string[]
  setCategories: Function
  enteredCategory: string
  setEnteredCategory: Function
  t: TranslateFn
}) => {
  const foundErrors = findFormErrors({ form, categories, enteredCategory, t })
  setErrors(foundErrors)

  if (foundErrors.categoryInput || !enteredCategory) return

  setCategories([...categories, enteredCategory])
  setEnteredCategory('')
}

export const addPillCategory = (
  category: string,
  categories: string[],
  setCategories: Function
) => {
  const index = categories.indexOf(category)

  if (index !== -1) return

  setCategories([...categories, category])
}
