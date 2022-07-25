export const hashCode = (str: string): number => {
  let hash = 0
  for (let i = 0, len = str.length; i < len; i += 1) {
    const chr = str.charCodeAt(i)
    // eslint-disable-next-line no-bitwise
    hash = (hash << 5) - hash + chr
    // eslint-disable-next-line no-bitwise
    hash |= 0 // Convert to 32bit integer
  }

  return hash
}
