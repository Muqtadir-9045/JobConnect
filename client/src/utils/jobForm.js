import { isValidDateString } from './validation'
import { JOB_TYPES, isJobType } from './jobs'
import { parseSkills } from './profile'

export const JOB_STATUS_OPTIONS = [
  { value: 'open', label: 'Open (accepting applications)' },
  { value: 'closed', label: 'Closed' },
]
export const JOB_TYPE_OPTIONS = JOB_TYPES.map(({ value, label }) => ({ value, label }))

const str = (value) => (value == null ? '' : String(value))

export const jobToForm = (job) => ({
  title: str(job.title),
  description: str(job.description),
  location: str(job.location),
  jobType: job.jobType ?? 'full-time',
  status: job.status ?? 'open',
  skills: (job.skills ?? []).join(', '),
  experienceYears: str(job.experienceYears),
  salaryMin: str(job.salary?.min),
  salaryMax: str(job.salary?.max),
  currency: job.salary?.currency ?? 'USD',
  deadline: job.deadline ? String(job.deadline).slice(0, 10) : '',
})

const isNumberText = (value) => value.trim() !== '' && Number.isFinite(Number(value))

export const validateJobForm = (values, original) => {
  const errors = {}
  const length = (value) => value.trim().length

  if (!length(values.title) || length(values.title) > 120) errors.title = 'Enter a title (up to 120 characters).'
  if (!length(values.description) || length(values.description) > 5000) errors.description = 'Enter a description (up to 5000 characters).'
  if (!length(values.location) || length(values.location) > 120) errors.location = 'Enter a location (up to 120 characters).'
  if (!isJobType(values.jobType)) errors.jobType = 'Choose a job type.'
  if (!JOB_STATUS_OPTIONS.some((option) => option.value === values.status)) errors.status = 'Choose a status.'

  const skills = parseSkills(values.skills)
  if (skills.length > 30) errors.skills = 'Add up to 30 skills.'
  else if (skills.some((skill) => skill.length > 50)) errors.skills = 'Each skill can be up to 50 characters.'

  const years = Number(values.experienceYears)
  if (!isNumberText(values.experienceYears) || years < 0 || years > 60) {
    errors.experienceYears = 'Enter a number between 0 and 60 (0 means entry level).'
  }

  for (const [field, label] of [['salaryMin', 'minimum'], ['salaryMax', 'maximum']]) {
    const value = values[field].trim()
    if (!value) {
      if (original[field]) errors[field] = 'A salary can be changed but not removed.'
    } else if (!isNumberText(value) || Number(value) < 0) {
      errors[field] = `Enter a valid ${label} salary (0 or more).`
    }
  }
  if (!errors.salaryMin && !errors.salaryMax && values.salaryMin.trim() && values.salaryMax.trim() && Number(values.salaryMax) < Number(values.salaryMin)) {
    errors.salaryMax = 'The maximum can’t be lower than the minimum.'
  }
  if (!/^[A-Za-z]{3}$/.test(values.currency.trim())) errors.currency = 'Use a 3-letter currency code, e.g. USD.'

  if (values.deadline !== original.deadline && values.deadline !== '') {
    const todayUtc = new Date().toISOString().slice(0, 10)
    if (!isValidDateString(values.deadline) || values.deadline <= todayUtc) errors.deadline = 'Choose a date after today.'
  }

  return errors
}

export const formToChanges = (values, original) => {
  const changes = {}
  for (const field of ['title', 'description', 'location']) {
    if (values[field].trim() !== original[field].trim()) changes[field] = values[field].trim()
  }
  for (const field of ['jobType', 'status']) {
    if (values[field] !== original[field]) changes[field] = values[field]
  }

  const skills = parseSkills(values.skills)
  if (JSON.stringify(skills) !== JSON.stringify(parseSkills(original.skills))) changes.skills = skills

  if (Number(values.experienceYears) !== Number(original.experienceYears)) changes.experienceYears = Number(values.experienceYears)

  const salary = {}
  if (values.salaryMin.trim() !== original.salaryMin) salary.min = Number(values.salaryMin)
  if (values.salaryMax.trim() !== original.salaryMax) salary.max = Number(values.salaryMax)
  if (values.currency.trim().toUpperCase() !== original.currency.toUpperCase()) salary.currency = values.currency.trim().toUpperCase()
  if (Object.keys(salary).length) changes.salary = salary

  if (values.deadline !== original.deadline) changes.deadline = values.deadline || null
  return changes
}

const SERVER_FIELD = { salary: 'salaryMax', 'salary.min': 'salaryMin', 'salary.max': 'salaryMax' }
export const serverErrorsToForm = (fieldErrors) =>
  Object.fromEntries(Object.entries(fieldErrors).map(([field, message]) => [SERVER_FIELD[field] ?? field, message]))

export const emptyJobForm = () => ({
  title: '',
  description: '',
  location: '',
  jobType: 'full-time',
  status: 'open',
  skills: '',
  experienceYears: '0',
  salaryMin: '',
  salaryMax: '',
  currency: 'USD',
  deadline: '',
})

export const formToNewJob = (values) => {
  const job = {
    title: values.title.trim(),
    description: values.description.trim(),
    location: values.location.trim(),
    jobType: values.jobType,
    experienceYears: Number(values.experienceYears),
  }

  const skills = parseSkills(values.skills)
  if (skills.length) job.skills = skills

  const salary = {}
  if (values.salaryMin.trim()) salary.min = Number(values.salaryMin)
  if (values.salaryMax.trim()) salary.max = Number(values.salaryMax)
  if (Object.keys(salary).length) job.salary = { ...salary, currency: values.currency.trim().toUpperCase() }

  if (values.deadline) job.deadline = values.deadline
  return job
}
