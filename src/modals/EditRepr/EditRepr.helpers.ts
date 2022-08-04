interface ReprForm {
  title?: string
  categoryInput?: string
  comment?: string
}

export const findFormErrors = ({ form, categories, enteredCategory }) => {
  const { title, comment, categoryInput } = form
  const newErrors = {} as ReprForm

  if (!title) newErrors.title = 'This field is required.'
  if (title?.includes('*'))
    newErrors.title = 'This field cannot contain an asterisk (*).'

  const indexExistingCategories = categories.findIndex(
    (c) => c === enteredCategory
  )

  if (indexExistingCategories !== -1)
    newErrors.categoryInput = appendError(
      newErrors.categoryInput,
      'That category already exists.'
    )

  if (enteredCategory.includes('*'))
    newErrors.categoryInput = appendError(
      newErrors.categoryInput,
      'This field cannot contain an asterisk (*).'
    )

  if (comment?.includes('*'))
    newErrors.comment = appendError(
      newErrors.comment,
      'This field cannot contain an asterisk (*).'
    )

  if (categoryInput.includes('*'))
    newErrors.categoryInput = appendError(
      newErrors.categoryInput,
      'This field cannot contain an asterisk (*).'
    )

  return newErrors
}

const appendError = (originalError: string, newError: string) =>
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
  const index = categories.findIndex((c) => c === category)

  if (index !== -1) return

  setCategories([...categories, category])
}
