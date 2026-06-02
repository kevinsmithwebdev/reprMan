export const jsonResponse = (
  statusCode: number,
  body: unknown,
  headers: Record<string, string> = {}
) => ({
  statusCode,
  headers: {
    'content-type': 'application/json',
    ...headers,
  },
  body: JSON.stringify(body),
})
