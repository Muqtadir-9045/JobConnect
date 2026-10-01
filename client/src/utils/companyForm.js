import { isHttpUrl } from './validation'

const OPTIONAL_FIELDS = ['industry', 'location', 'website', 'logoUrl', 'description']

const str = (value) => (value == null ? '' : String(value))

export const companyToForm = (company) => ({
  name: str(company?.name),
  industry: str(company?.industry),
  location: str(company?.location),
  website: str(company?.website),
  logoUrl: str(company?.logoUrl),
  description: str(company?.description),
})

export const validateCompanyForm = (values) => {
  const errors = {}
  const length = (field) => values[field].trim().length

  if (length('name') < 2 || length('name') > 100) errors.name = 'Enter the company name (2 to 100 characters).'
  if (length('industry') > 100) errors.industry = 'Keep the industry under 100 characters.'
  if (length('location') > 120) errors.location = 'Keep the location under 120 characters.'
  if (length('description') > 2000) errors.description = 'Keep the description under 2000 characters.'
  for (const field of ['website', 'logoUrl']) {
    const value = values[field].trim()
    if (value && (value.length > 500 || !isHttpUrl(value))) errors[field] = 'Enter a valid web address starting with http:// or https://'
  }
  return errors
}

export const formToPayload = (values, original = null) => {
  const value = (field) => values[field].trim()
  const payload = {}

  if (!original) {
    payload.name = value('name')
    for (const field of OPTIONAL_FIELDS) if (value(field)) payload[field] = value(field)
    return payload
  }

  if (value('name') !== original.name.trim()) payload.name = value('name')
  for (const field of OPTIONAL_FIELDS) {
    if (value(field) !== original[field].trim()) payload[field] = value(field) || null
  }
  return payload
}
