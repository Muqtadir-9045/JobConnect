import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import Alert from './ui/Alert'
import Badge from './ui/Badge'
import Button from './ui/Button'
import FileField from './ui/FileField'
import TextField from './ui/TextField'
import { Spinner } from './ui/Spinner'
import { useAuth } from '../hooks/useAuth'
import { useRequest } from '../hooks/useRequest'
import { applyToJob, getMyApplicationForJob } from '../services/applicationService'
import { PATHS } from '../routes/paths'
import { parseApiError } from '../utils/apiError'
import { getStatusInfo } from '../utils/applications'
import { formatDate, isExpired } from '../utils/jobs'
import { RESUME_ACCEPT, validateResumeFile } from '../utils/resume'
import { ROLES } from '../utils/roles'

const COVER_LETTER_MAX = 3000

function PanelSkeleton() {
  return (
    <div className="animate-pulse space-y-3" aria-hidden="true">
      <div className="h-11 rounded-lg bg-slate-200" />
      <div className="h-4 w-2/3 rounded bg-slate-100" />
    </div>
  )
}

function ApplicationStatus({ application, justApplied }) {
  const info = getStatusInfo(application.status)

  return (
    <div className="space-y-4">
      {justApplied && (
        <Alert tone="success">Your application was submitted. The recruiter will review it soon.</Alert>
      )}
      <div>
        <p className="text-sm font-medium text-slate-700">Your application</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge tone={info.tone} className="px-3 py-1 text-sm">
            {info.label}
          </Badge>
          <span className="text-sm text-slate-500">Applied {formatDate(application.createdAt)}</span>
        </div>
        {info.text && <p className="mt-3 text-sm text-slate-600">{info.text}</p>}
      </div>
    </div>
  )
}

function ApplyForm({ job, savedResume, onApplied, onAlreadyApplied }) {
  const [resumeFile, setResumeFile] = useState(null)
  const [useSavedResume, setUseSavedResume] = useState(Boolean(savedResume))
  const [coverLetter, setCoverLetter] = useState('')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleFile = (file) => {
    setResumeFile(file)
    setErrors((current) => ({ ...current, resume: undefined }))
  }

  const handleCoverLetter = (event) => {
    setCoverLetter(event.target.value)
    setErrors((current) => ({ ...current, coverLetter: undefined }))
  }

  const validate = () => {
    const found = {}
    if (useSavedResume) {
      if (!savedResume) found.resume = 'Upload a resume to apply.'
    } else if (!resumeFile) {
      found.resume = 'Choose a resume file to upload.'
    } else {
      const message = validateResumeFile(resumeFile)
      if (message) found.resume = message
    }
    if (coverLetter.length > COVER_LETTER_MAX) found.coverLetter = `Keep it under ${COVER_LETTER_MAX} characters.`
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
      const application = await applyToJob(job._id, {
        resumeFile: useSavedResume ? null : resumeFile,
        coverLetter: coverLetter.trim() || undefined,
      })
      onApplied(application)
    } catch (error) {
      const { message, fieldErrors, status } = parseApiError(error)
      if (status === 409) {
        onAlreadyApplied()
        return
      }
      const mapped = {}
      if (fieldErrors.resume) mapped.resume = fieldErrors.resume
      if (fieldErrors.coverLetter) mapped.coverLetter = fieldErrors.coverLetter
      setErrors(mapped)
      setFormError(Object.keys(mapped).length ? '' : message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {formError && <Alert tone="error">{formError}</Alert>}

      {savedResume && (
        <label className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={useSavedResume}
            onChange={(event) => setUseSavedResume(event.target.checked)}
            disabled={submitting}
            className="mt-0.5"
          />
          <span>
            Use your saved resume (<span className="font-medium">{savedResume.originalName}</span>). Uncheck to upload a
            different file for this application.
          </span>
        </label>
      )}

      {!useSavedResume && (
        <FileField
          label="Resume"
          accept={RESUME_ACCEPT}
          fileName={resumeFile?.name}
          onChange={handleFile}
          error={errors.resume}
          hint="PDF, DOC or DOCX, up to 4MB."
          disabled={submitting}
        />
      )}
      {useSavedResume && errors.resume && <p className="text-sm text-red-600">{errors.resume}</p>}

      <TextField
        label="Cover letter (optional)"
        name="coverLetter"
        multiline
        rows={5}
        value={coverLetter}
        onChange={handleCoverLetter}
        error={errors.coverLetter}
        hint={`${coverLetter.length}/${COVER_LETTER_MAX} characters`}
        placeholder="Tell the recruiter why you’re a great fit."
        disabled={submitting}
      />

      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting && <Spinner className="h-4 w-4 text-white" />}
        {submitting ? 'Submitting…' : 'Submit application'}
      </Button>
    </form>
  )
}

export default function ApplyPanel({ job }) {
  const { status: authStatus, isAuthenticated, role, user } = useAuth()
  const location = useLocation()
  const [formOpen, setFormOpen] = useState(false)
  const [justApplied, setJustApplied] = useState(false)

  const isCandidate = role === ROLES.CANDIDATE
  const application = useRequest((signal) => getMyApplicationForJob(job._id, { signal }), job._id, {
    enabled: isCandidate,
  })

  if (authStatus === 'loading') return <PanelSkeleton />

  if (!isAuthenticated) {
    const state = { from: location, message: 'Log in to apply for this job.' }
    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-600">Log in or create a free account to apply for this job.</p>
        <Button to={PATHS.login} state={state} size="lg" className="w-full">
          Log in to apply
        </Button>
        <Button to={PATHS.register} state={state} variant="secondary" className="w-full">
          Create an account
        </Button>
      </div>
    )
  }

  if (!isCandidate) {
    return (
      <Alert tone="info">
        {role === ROLES.RECRUITER ? 'Recruiter' : 'Admin'} accounts can’t apply for jobs. Sign in with a candidate
        account to apply.
      </Alert>
    )
  }

  if (application.status === 'loading') return <PanelSkeleton />

  if (application.status === 'error') {
    return (
      <div className="space-y-3" role="alert">
        <Alert tone="error">We couldn’t check your application status. {application.error}</Alert>
        <Button variant="secondary" className="w-full" onClick={application.retry}>
          Try again
        </Button>
      </div>
    )
  }

  if (application.data) return <ApplicationStatus application={application.data} justApplied={justApplied} />

  if (job.status !== 'open' || isExpired(job)) {
    return <Alert tone="warning">This job is no longer accepting applications.</Alert>
  }

  if (!formOpen) {
    return (
      <div className="space-y-3">
        <Button size="lg" className="w-full" onClick={() => setFormOpen(true)}>
          Apply now
        </Button>
        <p className="text-center text-xs text-slate-500">It only takes a minute.</p>
      </div>
    )
  }

  return (
    <ApplyForm
      job={job}
      savedResume={user?.resume?.filename ? user.resume : null}
      onApplied={(created) => {
        setJustApplied(true)
        application.setData(created)
      }}
      onAlreadyApplied={application.retry}
    />
  )
}
