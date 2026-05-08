export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

export const getUserId = (
  event: {
    requestContext?: {
      authorizer?: { jwt?: { claims?: Record<string, unknown> } }
    }
  }
): string => {
  const userId = event.requestContext?.authorizer?.jwt?.claims?.sub
  if (!userId || typeof userId !== 'string') {
    throw new UnauthorizedError()
  }
  return userId
}
