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
import { isValidEmail } from '../utils/validation'

export default function LoginPage() {
  const { login } = useAuth()
  const location = useLocation()
  const redirected = Boolean(location.state?.from)

  const [values, setValues] = useState({ email: '', password: '' })
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
    if (!values.email.trim()) found.email = 'Enter your email.'
    else if (!isValidEmail(values.email)) found.email = 'Enter a valid email address.'
    if (!values.password) found.password = 'Enter your password.'
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
      await login({ email: values.email.trim(), password: values.password })
    } catch (error) {
      setFormError(parseApiError(error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Container className="flex justify-center py-12 sm:py-16">
      <div className="w-full max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="mt-2 text-slate-600">Log in to manage your applications or your job postings.</p>
        </div>

        <Card className="mt-8">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {redirected && !formError && (
              <Alert tone="warning">{location.state?.message ?? 'Please log in to view that page.'}</Alert>
            )}
            {formError && <Alert tone="error">{formError}</Alert>}

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
              autoComplete="current-password"
              placeholder="Your password"
              value={values.password}
              onChange={handleChange}
              error={errors.password}
              disabled={submitting}
            />
            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting && <Spinner className="h-4 w-4 text-white" />}
              {submitting ? 'Logging in…' : 'Log in'}
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-slate-600">
          New to JobConnect?{' '}
          <Link to={PATHS.register} state={location.state} className="font-semibold text-brand-700 hover:text-brand-800">
            Create an account
          </Link>
        </p>
      </div>
    </Container>
  )
}
