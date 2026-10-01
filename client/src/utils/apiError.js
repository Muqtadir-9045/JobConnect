export function parseApiError(error) {
  if (!error.response) {
    return { message: 'We couldn’t reach the server. Check your connection and try again.', fieldErrors: {} }
  }

  const { status, data } = error.response
  const fieldErrors = {}
  for (const { field, message } of data?.errors ?? []) {
    if (field && !fieldErrors[field]) fieldErrors[field] = message
  }

  return {
    status,
    fieldErrors,
    message: data?.message || 'Something went wrong. Please try again.',
  }
}

export async function unwrapBlobError(error) {
  const data = error?.response?.data
  if (data instanceof Blob && data.type.includes('json')) {
    try {
      error.response.data = JSON.parse(await data.text())
    } catch {
    }
  }
  throw error
}
