import { PATHS } from '../routes/paths'

export const JOB_TYPES = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'freelance', label: 'Freelance' },
]

export const isJobType = (value) => JOB_TYPES.some((type) => type.value === value)

export const formatJobType = (value) => JOB_TYPES.find((type) => type.value === value)?.label ?? value

const moneyFormats = new Map()

const formatMoney = (amount, currency) => {
  try {
    let format = moneyFormats.get(currency)
    if (!format) {
      format = new Intl.NumberFormat('en', { style: 'currency', currency, maximumFractionDigits: 0 })
      moneyFormats.set(currency, format)
    }
    return format.format(amount)
  } catch {
    return `${currency} ${amount.toLocaleString('en')}`
  }
}

const shortDateFormat = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' })
const mediumDateFormat = new Intl.DateTimeFormat('en', { dateStyle: 'medium' })
const formatWith = (format, date) => {
  const value = new Date(date)
  return Number.isNaN(value.getTime()) ? 'Invalid Date' : format.format(value)
}

export const formatSalary = (salary) => {
  if (!salary) return null
  const { min, max, currency = 'USD' } = salary
  const hasMin = typeof min === 'number'
  const hasMax = typeof max === 'number'
  if (hasMin && hasMax) return `${formatMoney(min, currency)} – ${formatMoney(max, currency)}`
  if (hasMin) return `From ${formatMoney(min, currency)}`
  if (hasMax) return `Up to ${formatMoney(max, currency)}`
  return null
}

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

export const timeAgo = (date) => {
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000)
  if (days < 7) return rtf.format(-Math.max(days, 0), 'day')
  if (days < 30) return rtf.format(-Math.floor(days / 7), 'week')
  return rtf.format(-Math.floor(days / 30), 'month')
}

export const formatShortDate = (date) => formatWith(shortDateFormat, date)

const MAX_TEXT = 100

export const readFilters = (searchParams) => {
  const text = (key) => (searchParams.get(key) ?? '').trim().slice(0, MAX_TEXT)
  const jobType = searchParams.get('jobType')
  const page = Number.parseInt(searchParams.get('page') ?? '', 10)
  return {
    q: text('q'),
    location: text('location'),
    jobType: isJobType(jobType) ? jobType : '',
    page: Number.isInteger(page) && page > 0 ? page : 1,
  }
}

export const toSearchParams = ({ q, location, jobType, page } = {}) => {
  const params = new URLSearchParams()
  if (q?.trim()) params.set('q', q.trim())
  if (location?.trim()) params.set('location', location.trim())
  if (jobType) params.set('jobType', jobType)
  if (page > 1) params.set('page', String(page))
  return params
}

export const jobsPath = (filters) => {
  const query = toSearchParams(filters).toString()
  return query ? `${PATHS.jobs}?${query}` : PATHS.jobs
}

export const getInitials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')

export const formatExperience = (years) => {
  if (typeof years !== 'number') return null
  if (years <= 0) return 'Entry level'
  return `${years}+ ${years === 1 ? 'year' : 'years'}`
}

export const isExpired = (job) => Boolean(job.deadline) && new Date(job.deadline).getTime() < Date.now()

export const formatDate = (date) => formatWith(mediumDateFormat, date)

export const timeUntil = (date) => {
  const days = Math.ceil((new Date(date).getTime() - Date.now()) / 86_400_000)
  if (days <= 30) return rtf.format(Math.max(days, 0), 'day')
  if (days <= 90) return rtf.format(Math.round(days / 7), 'week')
  return rtf.format(Math.round(days / 30), 'month')
}

export const getJobStatus = (job) => {
  if (job.status === 'closed') return { label: 'Closed', tone: 'neutral' }
  if (isExpired(job)) return { label: 'Expired', tone: 'warning' }
  return { label: 'Open', tone: 'success' }
}
