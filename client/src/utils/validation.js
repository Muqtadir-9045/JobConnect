export const isValidEmail = (value) => {
  const email = value.trim()
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export const isValidPassword = (value) => value.length >= 8 && new TextEncoder().encode(value).length <= 72

export const isHttpUrl = (value) => {
  try {
    const { protocol } = new URL(value.trim())
    return protocol === 'http:' || protocol === 'https:'
  } catch {
    return false
  }
}

export const isValidPhone = (value) => /^\+?[0-9\s\-().]{7,20}$/.test(value) && (value.match(/\d/g) ?? []).length >= 7

export const isValidDateString = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(value)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}
