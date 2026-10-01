import { useId, useState } from 'react'
import Button from './ui/Button'
import { MapPinIcon, SearchIcon } from './ui/Icons'
import { cn } from '../utils/cn'
import { JOB_TYPES } from '../utils/jobs'

const fieldWrapper = 'relative flex-1 rounded-lg focus-within:ring-2 focus-within:ring-brand-600'
const fieldInput =
  'block w-full rounded-lg border-0 bg-transparent py-3 pl-10 pr-3 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none sm:text-sm'
const fieldIcon = 'pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400'

export default function JobSearchForm({ initialValues = {}, onSubmit, showJobType = false }) {
  const id = useId()
  const [values, setValues] = useState({
    q: initialValues.q ?? '',
    location: initialValues.location ?? '',
    jobType: initialValues.jobType ?? '',
  })

  const handleChange = (event) => setValues((current) => ({ ...current, [event.target.name]: event.target.value }))

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit(values)
  }

  const handleJobTypeChange = (event) => {
    const next = { ...values, jobType: event.target.value }
    setValues(next)
    onSubmit(next)
  }

  return (
    <form
      role="search"
      aria-label="Search jobs"
      onSubmit={handleSubmit}
      className={cn(
        'flex flex-col gap-2 rounded-2xl bg-white p-2 text-left shadow-lg ring-1 ring-slate-200',
        showJobType ? 'lg:flex-row lg:items-center' : 'sm:flex-row sm:items-center',
      )}
    >
      <div className={fieldWrapper}>
        <label htmlFor={`${id}-q`} className="sr-only">
          Job title or keyword
        </label>
        <SearchIcon className={fieldIcon} />
        <input
          id={`${id}-q`}
          name="q"
          type="search"
          value={values.q}
          onChange={handleChange}
          maxLength={100}
          placeholder="Job title, skill or keyword"
          autoComplete="off"
          className={fieldInput}
        />
      </div>

      <div className={fieldWrapper}>
        <label htmlFor={`${id}-location`} className="sr-only">
          Location
        </label>
        <MapPinIcon className={fieldIcon} />
        <input
          id={`${id}-location`}
          name="location"
          type="text"
          value={values.location}
          onChange={handleChange}
          maxLength={100}
          placeholder="City or country"
          autoComplete="off"
          className={fieldInput}
        />
      </div>

      {showJobType && (
        <div className="relative rounded-lg focus-within:ring-2 focus-within:ring-brand-600 lg:w-48">
          <label htmlFor={`${id}-type`} className="sr-only">
            Job type
          </label>
          <select
            id={`${id}-type`}
            name="jobType"
            value={values.jobType}
            onChange={handleJobTypeChange}
            className="block w-full rounded-lg border-0 bg-transparent py-3 pl-3 pr-8 text-base text-slate-900 focus:outline-none sm:text-sm"
          >
            <option value="">All job types</option>
            {JOB_TYPES.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      )}

      <Button type="submit" size="lg" className="sm:px-8">
        Search
      </Button>
    </form>
  )
}
