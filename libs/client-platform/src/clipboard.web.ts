export const copyText = async (text: string): Promise<void> => {
  if (!globalThis.navigator?.clipboard?.writeText) {
    throw new Error('Clipboard API is not available')
  }
  await globalThis.navigator.clipboard.writeText(text)
}
