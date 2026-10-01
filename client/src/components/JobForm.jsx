import { useMemo, useRef, useState } from 'react'
import Alert from './ui/Alert'
import Button from './ui/Button'
import Card from './ui/Card'
import TextField from './ui/TextField'
import { Spinner } from './ui/Spinner'
import { createJob, updateJob } from '../services/jobService'
import { parseApiError } from '../utils/apiError'
import {
  JOB_STATUS_OPTIONS,
  JOB_TYPE_OPTIONS,
  emptyJobForm,
  formToChanges,
  formToNewJob,
  jobToForm,
  serverErrorsToForm,
  validateJobForm,
} from '../utils/jobForm'

export default function JobForm({ job, onSaved, onCancel }) {
  const isEditing = Boolean(job)
  const formRef = useRef(null)
  const original = useMemo(() => (job ? jobToForm(job) : emptyJobForm()), [job])
  const [values, setValues] = useState(original)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [unchanged, setUnchanged] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const focusFirstError = () =>
    setTimeout(() => formRef.current?.querySelector('[aria-invalid="true"]')?.focus(), 0)

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => (current[name] ? { ...current, [name]: undefined } : current))
    setUnchanged(false)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')
    setUnchanged(false)

    const found = validateJobForm(values, original)
    setErrors(found)
    if (Object.keys(found).length) {
      setFormError('Please fix the highlighted fields and try again.')
      focusFirstError()
      return
    }

    let changes = null
    if (isEditing) {
      changes = formToChanges(values, original)
      if (Object.keys(changes).length === 0) {
        setUnchanged(true)
        return
      }
    }

    setSubmitting(true)
    try {
      onSaved(isEditing ? await updateJob(job._id, changes) : await createJob(formToNewJob(values)))
    } catch (error) {
      const { message, fieldErrors } = parseApiError(error)
      const mapped = serverErrorsToForm(fieldErrors)
      setErrors(mapped)
      setFormError(Object.keys(mapped).length ? 'Please fix the highlighted fields and try again.' : message)
      focusFirstError()
    } finally {
      setSubmitting(false)
    }
  }

  const field = (name) => ({ name, value: values[name], onChange: handleChange, error: errors[name], disabled: submitting })

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6" noValidate>
      {formError && <Alert tone="error">{formError}</Alert>}
      {unchanged && <Alert>You haven’t changed anything yet.</Alert>}

      <Card>
        <h2 className="text-lg font-semibold">Job details</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <TextField
            className="sm:col-span-2"
            label="Job title"
            placeholder={isEditing ? undefined : 'e.g. React Developer'}
            {...field('title')}
          />
          <TextField label="Location" placeholder={isEditing ? undefined : 'City, State or Remote'} {...field('location')} />
          <TextField label="Job type" options={JOB_TYPE_OPTIONS} {...field('jobType')} />
          <TextField
            className="sm:col-span-2"
            label="Description"
            multiline
            rows={10}
            placeholder={isEditing ? undefined : 'What will the person do, and what should they bring?'}
            hint={`${values.description.length}/5000 characters`}
            {...field('description')}
          />
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">Requirements</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <TextField
            className="sm:col-span-2"
            label="Skills"
            placeholder="react, node, sql"
            hint="Separate skills with commas. Up to 30."
            {...field('skills')}
          />
          <TextField
            label="Years of experience"
            type="number"
            inputMode="numeric"
            min="0"
            max="60"
            hint="0 means entry level."
            {...field('experienceYears')}
          />
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">{isEditing ? 'Salary, deadline and status' : 'Salary and deadline'}</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          <TextField label="Minimum salary" type="number" inputMode="numeric" min="0" {...field('salaryMin')} />
          <TextField label="Maximum salary" type="number" inputMode="numeric" min="0" {...field('salaryMax')} />
          <TextField label="Currency" maxLength={3} placeholder="USD" {...field('currency')} />
          <TextField
            className={isEditing ? undefined : 'sm:col-span-2'}
            label="Application deadline (optional)"
            type="date"
            hint={isEditing ? 'Clear the date to remove the deadline.' : 'Leave empty for no deadline.'}
            {...field('deadline')}
          />
          {isEditing && (
            <TextField
              className="sm:col-span-2"
              label="Status"
              options={JOB_STATUS_OPTIONS}
              hint="Closed jobs are hidden from candidates."
              {...field('status')}
            />
          )}
        </div>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" size="lg" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting && <Spinner className="h-4 w-4 text-white" />}
          {submitting ? (isEditing ? 'Saving…' : 'Posting…') : isEditing ? 'Save changes' : 'Post job'}
        </Button>
      </div>
    </form>
  )
}
