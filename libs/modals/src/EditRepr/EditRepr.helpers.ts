import { FILE_LINE_DELIMITER } from '@reprman/constants'

export interface ReprForm {
  title: string
  categoryInput: string
  comment: string
  learning: boolean
}

export type ReprFormErrors = Partial<ReprForm>

export const findFormErrors = ({
  form,
  categories,
  enteredCategory,
}: {
  form: ReprForm
  categories: string[]
  enteredCategory: string
}) => {
  const { title, comment, categoryInput } = form
  const newErrors = {} as ReprFormErrors

  if (!title) newErrors.title = 'This field is required.'
  if (title?.includes(FILE_LINE_DELIMITER))
    newErrors.title = 'This field cannot contain an asterisk (*).'

  const indexExistingCategories = categories.indexOf(enteredCategory)

  if (indexExistingCategories !== -1)
    newErrors.categoryInput = appendError(
      newErrors.categoryInput,
      'That category already exists.'
    )

  if (enteredCategory.includes(FILE_LINE_DELIMITER))
    newErrors.categoryInput = appendError(
      newErrors.categoryInput,
      'This field cannot contain an asterisk (*).'
    )

  if (comment?.includes(FILE_LINE_DELIMITER))
    newErrors.comment = appendError(
      newErrors.comment,
      'This field cannot contain an asterisk (*).'
    )

  if (categoryInput.includes(FILE_LINE_DELIMITER))
    newErrors.categoryInput = appendError(
      newErrors.categoryInput,
      'This field cannot contain an asterisk (*).'
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
}) => {
  const foundErrors = findFormErrors({ form, categories, enteredCategory })
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
