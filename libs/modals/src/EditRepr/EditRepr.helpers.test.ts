import { describe, expect, it, vi } from 'vitest'

import {
  addCategory,
  addPillCategory,
  findFormErrors,
  removeCategory,
  type ReprForm,
} from './EditRepr.helpers'

const baseForm: ReprForm = {
  title: 'Title',
  categoryInput: '',
  comment: '',
  learning: false,
}

describe('findFormErrors', () => {
  it('requires title', () => {
    expect(
      findFormErrors({
        form: { ...baseForm, title: '' },
        categories: [],
        enteredCategory: '',
      })
    ).toEqual({ title: 'This field is required.' })
  })

  it('rejects asterisk in title', () => {
    expect(
      findFormErrors({
        form: { ...baseForm, title: 'bad*title' },
        categories: [],
        enteredCategory: '',
      })
    ).toEqual({
      title: 'This field cannot contain an asterisk (*).',
    })
  })

  it('rejects duplicate category', () => {
    expect(
      findFormErrors({
        form: baseForm,
        categories: ['existing'],
        enteredCategory: 'existing',
      })
    ).toEqual({ categoryInput: 'That category already exists.' })
  })

  it('rejects asterisk in entered category and categoryInput', () => {
    expect(
      findFormErrors({
        form: { ...baseForm, categoryInput: 'bad*' },
        categories: [],
        enteredCategory: 'x*y',
      })
    ).toEqual({
      categoryInput: ' This field cannot contain an asterisk (*).',
    })
  })

  it('rejects asterisk in comment', () => {
    expect(
      findFormErrors({
        form: { ...baseForm, comment: 'note*' },
        categories: [],
        enteredCategory: '',
      })
    ).toEqual({ comment: 'This field cannot contain an asterisk (*).' })
  })

  it('returns no errors for valid form', () => {
    expect(
      findFormErrors({
        form: baseForm,
        categories: ['a'],
        enteredCategory: 'b',
      })
    ).toEqual({})
  })
})

describe('removeCategory', () => {
  it('removes category via setter', () => {
    const setCategories = vi.fn()
    removeCategory('a', ['a', 'b'], setCategories)
    expect(setCategories).toHaveBeenCalledWith(['b'])
  })
})

describe('addCategory', () => {
  it('sets errors and does not add when category validation fails', () => {
    const setErrors = vi.fn()
    const setCategories = vi.fn()
    const setEnteredCategory = vi.fn()

    addCategory({
      form: baseForm,
      setErrors,
      categories: ['dup'],
      setCategories,
      enteredCategory: 'dup',
      setEnteredCategory,
    })

    expect(setErrors).toHaveBeenCalled()
    expect(setCategories).not.toHaveBeenCalled()
  })

  it('adds category and clears input when valid', () => {
    const setErrors = vi.fn()
    const setCategories = vi.fn()
    const setEnteredCategory = vi.fn()

    addCategory({
      form: baseForm,
      setErrors,
      categories: ['a'],
      setCategories,
      enteredCategory: 'b',
      setEnteredCategory,
    })

    expect(setErrors).toHaveBeenCalledWith({})
    expect(setCategories).toHaveBeenCalledWith(['a', 'b'])
    expect(setEnteredCategory).toHaveBeenCalledWith('')
  })

  it('does nothing when enteredCategory is empty', () => {
    const setCategories = vi.fn()
    addCategory({
      form: baseForm,
      setErrors: vi.fn(),
      categories: [],
      setCategories,
      enteredCategory: '',
      setEnteredCategory: vi.fn(),
    })
    expect(setCategories).not.toHaveBeenCalled()
  })
})

describe('addPillCategory', () => {
  it('adds category when not present', () => {
    const setCategories = vi.fn()
    addPillCategory('new', ['a'], setCategories)
    expect(setCategories).toHaveBeenCalledWith(['a', 'new'])
  })

  it('does not add duplicate category', () => {
    const setCategories = vi.fn()
    addPillCategory('a', ['a'], setCategories)
    expect(setCategories).not.toHaveBeenCalled()
  })
})
