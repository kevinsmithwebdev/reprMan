import { Categories, Reprs } from '@reprman/types'

function compareCategoryNames(left: string, right: string): number {
  return left.localeCompare(right)
}

function sortCategoryNames(names: Iterable<string>): Categories {
  return Array.from(names).sort(compareCategoryNames)
}

export const getAllCategories = (reprs: Reprs): Categories => {
  const categoriesSet = new Set<string>()
  reprs.forEach(({ categories }) =>
    categories.forEach((category) => categoriesSet.add(category))
  )
  return sortCategoryNames(categoriesSet)
}

export const mergeCategories = (c1: Categories, c2: Categories): Categories => {
  const categoriesSet = new Set<string>()
  ;[...c1, ...c2].forEach((category) => categoriesSet.add(category))
  return sortCategoryNames(categoriesSet)
}
