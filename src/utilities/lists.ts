export const getUniqueArray = (arr: any[]) => Array.from(new Set(arr).values())

export const getComplement = (arr1: any[] = [], arr2: any[] = []) =>
  arr1.filter((el) => !arr2.includes(el))

export const getIntersection = (arr1: any[], arr2: any[]) =>
  arr1.filter((el) => arr2.includes(el))

export const getDoesContainsAll = (set: any[], subset: any[]) =>
  subset.every((el) => set.includes(el))
