import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Container from '../components/ui/Container'
import TextField from '../components/ui/TextField'
import { Spinner } from '../components/ui/Spinner'
import { useAuth } from '../hooks/useAuth'
import { PATHS } from '../routes/paths'
import { parseApiError } from '../utils/apiError'
import { ROLES } from '../utils/roles'
import { isValidEmail, isValidPassword } from '../utils/validation'
import { cn } from '../utils/cn'

const accountTypes = [
  { value: ROLES.CANDIDATE, title: 'I’m looking for a job', text: 'Search roles and apply' },
  { value: ROLES.RECRUITER, title: 'I’m hiring', text: 'Post jobs and review applicants' },
]

const FIELDS = ['name', 'email', 'password']

export default function RegisterPage() {
  const { register } = useAuth()
  const location = useLocation()

  const [role, setRole] = useState(ROLES.CANDIDATE)
  const [values, setValues] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const validate = () => {
    const found = {}
    const name = values.name.trim()
    if (name.length < 2 || name.length > 80) found.name = 'Enter your name (2 to 80 characters).'
    if (!isValidEmail(values.email)) found.email = 'Enter a valid email address.'
    if (!isValidPassword(values.password)) found.password = 'Use 8 to 72 characters.'
    return found
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')

    const found = validate()
    setErrors(found)
    if (Object.keys(found).length) return

    setSubmitting(true)
    try {
      await register({ name: values.name.trim(), email: values.email.trim(), password: values.password, role })
    } catch (error) {
      const { message, fieldErrors, status } = parseApiError(error)
      const mapped = Object.fromEntries(Object.entries(fieldErrors).filter(([field]) => FIELDS.includes(field)))
      if (status === 409) mapped.email = message
      setErrors(mapped)
      setFormError(Object.keys(mapped).length ? '' : fieldErrors.role || message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Container className="flex justify-center py-12 sm:py-16">
      <div className="w-full max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Create your account</h1>
          <p className="mt-2 text-slate-600">Join JobConnect as a candidate or a recruiter.</p>
        </div>

        <Card className="mt-8">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {formError && <Alert tone="error">{formError}</Alert>}

            <fieldset disabled={submitting}>
              <legend className="mb-1.5 text-sm font-medium text-slate-700">I want to</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {accountTypes.map(({ value, title, text }) => (
                  <label
                    key={value}
                    className={cn(
                      'cursor-pointer rounded-lg border p-3 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-600',
                      role === value ? 'border-brand-600 bg-brand-50' : 'border-slate-300 hover:bg-slate-50',
                    )}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={value}
                      checked={role === value}
                      onChange={() => setRole(value)}
                      className="sr-only"
                    />
                    <span className="block text-sm font-semibold text-slate-900">{title}</span>
                    <span className="mt-0.5 block text-xs text-slate-600">{text}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <TextField
              label="Full name"
              name="name"
              autoComplete="name"
              placeholder="Alex Morgan"
              value={values.name}
              onChange={handleChange}
              error={errors.name}
              disabled={submitting}
            />
            <TextField
              label="Email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={values.email}
              onChange={handleChange}
              error={errors.email}
              disabled={submitting}
            />
            <TextField
              label="Password"
              type="password"
              name="password"
              autoComplete="new-password"
              hint="8 to 72 characters."
              value={values.password}
              onChange={handleChange}
              error={errors.password}
              disabled={submitting}
            />
            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting && <Spinner className="h-4 w-4 text-white" />}
              {submitting ? 'Creating account…' : 'Create account'}
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to={PATHS.login} state={location.state} className="font-semibold text-brand-700 hover:text-brand-800">
            Log in
          </Link>
        </p>
      </div>
    </Container>
  )
}
