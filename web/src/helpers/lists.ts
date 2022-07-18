export const getUniqueArray = (arr: any[]) => Array.from(new Set(arr).values())

export const getComplement = (arr1: any[], arr2: any[]) =>
  arr1.filter((el) => !arr2.includes(el))
