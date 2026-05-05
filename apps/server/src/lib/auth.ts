export const getUserId = (
  event: {
    requestContext?: {
      authorizer?: { jwt?: { claims?: Record<string, unknown> } }
    }
  }
): string => {
  const userId = event.requestContext?.authorizer?.jwt?.claims?.sub
  if (!userId || typeof userId !== 'string') {
    throw new Error('Missing user claim')
  }
  return userId
}
