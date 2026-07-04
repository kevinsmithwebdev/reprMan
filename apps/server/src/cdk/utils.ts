export function firstNonEmpty(
  ...candidates: (string | undefined)[]
): string | undefined {
  const found = candidates.find((c) => Boolean(c?.trim()))
  return found?.trim()
}
