import { Categories, Reprs } from '@reprman/types'

export const getAllCategories = (reprs: Reprs): Categories => {
  const categoriesSet = new Set()
  reprs.forEach(({ categories }) =>
    categories.forEach((category) => categoriesSet.add(category))
  )
  return Array.from(categoriesSet).sort() as Categories
}

export const mergeCategories = (c1: Categories, c2: Categories): Categories => {
  const categoriesSet = new Set()
  const combinedCategories = [...c1, ...c2]
  combinedCategories.forEach((c) => categoriesSet.add(c))
  return Array.from(categoriesSet).sort() as Categories
}
