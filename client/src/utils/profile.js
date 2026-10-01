import { isValidDateString, isValidPhone } from './validation'

export const LIMITS = { education: 10, experience: 20, skills: 30 }
const MIN_YEAR = 1950
const maxYear = () => new Date().getFullYear() + 10

let keyCounter = 0
const nextKey = () => ++keyCounter

export const emptyEducation = () => ({ _key: nextKey(), institution: '', degree: '', fieldOfStudy: '', startYear: '', endYear: '' })
export const emptyExperience = () => ({ _key: nextKey(), title: '', company: '', startDate: '', endDate: '', description: '' })

const text = (value) => value ?? ''
const day = (date) => (date ? String(date).slice(0, 10) : '')

export const parseSkills = (value) => [...new Set(value.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean))]

export const profileToForm = (profile) => ({
  name: text(profile.name),
  phone: text(profile.phone),
  location: text(profile.location),
  bio: text(profile.bio),
  skills: (profile.skills ?? []).join(', '),
  education: (profile.education ?? []).map((e) => ({
    _key: nextKey(),
    institution: text(e.institution),
    degree: text(e.degree),
    fieldOfStudy: text(e.fieldOfStudy),
    startYear: e.startYear != null ? String(e.startYear) : '',
    endYear: e.endYear != null ? String(e.endYear) : '',
  })),
  experience: (profile.experience ?? []).map((e) => ({
    _key: nextKey(),
    title: text(e.title),
    company: text(e.company),
    startDate: day(e.startDate),
    endDate: day(e.endDate),
    description: text(e.description),
  })),
})

export const formToPayload = (values) => {
  const orNull = (value) => value.trim() || null
  return {
    name: values.name.trim(),
    phone: orNull(values.phone),
    location: orNull(values.location),
    bio: orNull(values.bio),
    skills: parseSkills(values.skills),
    education: values.education.map((e) => ({
      institution: e.institution.trim(),
      degree: e.degree.trim(),
      ...(e.fieldOfStudy.trim() && { fieldOfStudy: e.fieldOfStudy.trim() }),
      ...(e.startYear.trim() && { startYear: Number(e.startYear) }),
      ...(e.endYear.trim() && { endYear: Number(e.endYear) }),
    })),
    experience: values.experience.map((e) => ({
      title: e.title.trim(),
      company: e.company.trim(),
      startDate: e.startDate,
      ...(e.endDate && { endDate: e.endDate }),
      ...(e.description.trim() && { description: e.description.trim() }),
    })),
  }
}

export const validateProfileForm = (values) => {
  const errors = {}
  const tooLong = (value, max) => value.trim().length > max
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  const name = values.name.trim()
  if (name.length < 2 || name.length > 80) errors.name = 'Enter your name (2 to 80 characters).'
  if (values.phone.trim() && !isValidPhone(values.phone.trim())) errors.phone = 'Enter a valid phone number, for example +1 555 123 4567.'
  if (tooLong(values.location, 120)) errors.location = 'Keep your location under 120 characters.'
  if (tooLong(values.bio, 1000)) errors.bio = 'Keep your bio under 1000 characters.'

  const skills = parseSkills(values.skills)
  if (skills.length > LIMITS.skills) errors.skills = `Add up to ${LIMITS.skills} skills.`
  else if (skills.some((skill) => skill.length > 50)) errors.skills = 'Each skill can be up to 50 characters.'

  values.education.forEach((entry, i) => {
    const path = (field) => `education[${i}].${field}`
    for (const field of ['institution', 'degree']) {
      const value = entry[field].trim()
      if (!value || value.length > 120) errors[path(field)] = `Enter the ${field} (up to 120 characters).`
    }
    if (tooLong(entry.fieldOfStudy, 120)) errors[path('fieldOfStudy')] = 'Keep this under 120 characters.'

    const years = {}
    for (const field of ['startYear', 'endYear']) {
      const value = entry[field].trim()
      if (!value) continue
      const year = Number(value)
      if (!/^\d{4}$/.test(value) || year < MIN_YEAR || year > maxYear()) {
        errors[path(field)] = `Enter a year between ${MIN_YEAR} and ${maxYear()}.`
      } else {
        years[field] = year
      }
    }
    if (years.startYear && years.endYear && years.endYear < years.startYear) {
      errors[path('endYear')] = 'The end year can’t be before the start year.'
    }
  })

  values.experience.forEach((entry, i) => {
    const path = (field) => `experience[${i}].${field}`
    for (const field of ['title', 'company']) {
      const value = entry[field].trim()
      if (!value || value.length > 120) errors[path(field)] = `Enter the ${field} (up to 120 characters).`
    }
    if (tooLong(entry.description, 1000)) errors[path('description')] = 'Keep the description under 1000 characters.'

    if (!isValidDateString(entry.startDate)) errors[path('startDate')] = 'Enter a valid start date.'
    else if (entry.startDate > tomorrow) errors[path('startDate')] = 'The start date can’t be in the future.'

    if (entry.endDate) {
      if (!isValidDateString(entry.endDate)) errors[path('endDate')] = 'Enter a valid end date.'
      else if (entry.endDate > tomorrow) errors[path('endDate')] = 'The end date can’t be in the future.'
      else if (!errors[path('startDate')] && entry.endDate < entry.startDate) errors[path('endDate')] = 'The end date can’t be before the start date.'
    }
  })

  return errors
}

const monthYearFormat = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric', timeZone: 'UTC' })
export const formatMonthYear = (date) => {
  const value = new Date(date)
  return Number.isNaN(value.getTime()) ? 'Invalid Date' : monthYearFormat.format(value)
}

export const summarizeEducation = (education = []) => {
  if (education.length === 0) return null
  const recency = (entry) => entry.endYear ?? entry.startYear ?? 0
  const latest = [...education].sort((a, b) => recency(b) - recency(a))[0]
  const study = [latest.degree, latest.fieldOfStudy].filter(Boolean).join(' in ')
  const extra = education.length > 1 ? ` (+${education.length - 1} more)` : ''
  return `${study}, ${latest.institution}${extra}`
}

export const summarizeExperience = (experience = []) => {
  if (experience.length === 0) return null
  const recency = (entry) => (entry.endDate ? new Date(entry.endDate).getTime() : Infinity)
  const latest = [...experience].sort((a, b) => recency(b) - recency(a))[0]
  const period = latest.endDate ? `until ${formatMonthYear(latest.endDate)}` : 'current'
  const extra = experience.length > 1 ? ` (+${experience.length - 1} more)` : ''
  return `${latest.title} at ${latest.company}, ${period}${extra}`
}
