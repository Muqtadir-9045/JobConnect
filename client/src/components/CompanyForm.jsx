import { useMemo, useRef, useState } from 'react'
import Alert from './ui/Alert'
import Button from './ui/Button'
import Card from './ui/Card'
import TextField from './ui/TextField'
import { Spinner } from './ui/Spinner'
import { createCompany, updateCompany } from '../services/companyService'
import { parseApiError } from '../utils/apiError'
import { companyToForm, formToPayload, validateCompanyForm } from '../utils/companyForm'

export default function CompanyForm({ company, onSaved, onCancel }) {
  const formRef = useRef(null)
  const original = useMemo(() => (company ? companyToForm(company) : null), [company])
  const [values, setValues] = useState(() => original ?? companyToForm(null))
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

    const found = validateCompanyForm(values)
    setErrors(found)
    if (Object.keys(found).length) {
      setFormError('Please fix the highlighted fields and try again.')
      focusFirstError()
      return
    }

    const payload = formToPayload(values, original)
    if (company && Object.keys(payload).length === 0) {
      setUnchanged(true)
      return
    }

    setSubmitting(true)
    try {
      onSaved(company ? await updateCompany(company._id, payload) : await createCompany(payload))
    } catch (error) {
      const { message, fieldErrors, status } = parseApiError(error)
      const mapped = { ...fieldErrors }
      if (status === 409 && /name/i.test(message)) mapped.name = message
      setErrors(mapped)
      setFormError(
        Object.keys(mapped).length ? 'Please fix the highlighted fields and try again.' : message,
      )
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
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField className="sm:col-span-2" label="Company name" autoComplete="organization" {...field('name')} />
          <TextField label="Industry (optional)" placeholder="e.g. Software Development" {...field('industry')} />
          <TextField label="Location (optional)" placeholder="City, Country" {...field('location')} />
          <TextField
            label="Website (optional)"
            type="url"
            inputMode="url"
            placeholder="https://www.example.com"
            {...field('website')}
          />
          <TextField
            label="Logo URL (optional)"
            type="url"
            inputMode="url"
            placeholder="https://…/logo.png"
            hint="A link to an image. Uploading files isn’t supported."
            {...field('logoUrl')}
          />
          <TextField
            className="sm:col-span-2"
            label="Description (optional)"
            multiline
            rows={6}
            placeholder="What does your company do, and what is it like to work there?"
            hint={`${values.description.length}/2000 characters`}
            {...field('description')}
          />
        </div>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {company && (
          <Button variant="secondary" size="lg" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting && <Spinner className="h-4 w-4 text-white" />}
          {submitting ? 'Saving…' : company ? 'Save changes' : 'Create company'}
        </Button>
      </div>
    </form>
  )
}
