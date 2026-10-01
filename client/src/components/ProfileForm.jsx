import { useRef, useState } from 'react'
import Alert from './ui/Alert'
import Button from './ui/Button'
import Card from './ui/Card'
import FileField from './ui/FileField'
import TextField from './ui/TextField'
import { PlusIcon } from './ui/Icons'
import { Spinner } from './ui/Spinner'
import { deleteResume, updateProfile, uploadResume } from '../services/candidateService'
import { parseApiError } from '../utils/apiError'
import { RESUME_ACCEPT, validateResumeFile } from '../utils/resume'
import {
  LIMITS,
  emptyEducation,
  emptyExperience,
  formToPayload,
  profileToForm,
  validateProfileForm,
} from '../utils/profile'

const thisYear = new Date().getFullYear()

function EntryHeader({ title, onRemove, disabled }) {
  return (
    <div className="flex items-center justify-between">
      <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
      <Button variant="ghost" size="sm" onClick={onRemove} disabled={disabled}>
        Remove
      </Button>
    </div>
  )
}

export default function ProfileForm({ profile, onSaved, onCancel }) {
  const formRef = useRef(null)
  const [values, setValues] = useState(() => profileToForm(profile))
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [resumeFile, setResumeFile] = useState(null)
  const [removeResume, setRemoveResume] = useState(false)
  const savedResume = !removeResume ? profile.resume : null

  const clearError = (path) => setErrors((current) => (current[path] ? { ...current, [path]: undefined } : current))

  const focusFirstError = () =>
    setTimeout(() => formRef.current?.querySelector('[aria-invalid="true"]')?.focus(), 0)

  const handleField = (event) => {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    clearError(name)
  }

  const handleResumeFile = (file) => {
    setResumeFile(file)
    setRemoveResume(false)
    clearError('resume')
  }

  const handleRemoveResume = () => {
    setResumeFile(null)
    setRemoveResume(true)
    clearError('resume')
  }

  const handleUndoRemoveResume = () => setRemoveResume(false)

  const handleEntry = (list, index, field) => (event) => {
    const { value } = event.target
    setValues((current) => ({
      ...current,
      [list]: current[list].map((entry, i) => (i === index ? { ...entry, [field]: value } : entry)),
    }))
    clearError(`${list}[${index}].${field}`)
  }

  const addEntry = (list, create) =>
    setValues((current) => (current[list].length >= LIMITS[list] ? current : { ...current, [list]: [...current[list], create()] }))

  const removeEntry = (list, index) => {
    setValues((current) => ({ ...current, [list]: current[list].filter((_, i) => i !== index) }))
    setErrors((current) => Object.fromEntries(Object.entries(current).filter(([path]) => !path.startsWith(`${list}[`))))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')

    const found = validateProfileForm(values)
    if (resumeFile) {
      const message = validateResumeFile(resumeFile)
      if (message) found.resume = message
    }
    setErrors(found)
    if (Object.keys(found).length) {
      setFormError('Please fix the highlighted fields and try again.')
      focusFirstError()
      return
    }

    setSubmitting(true)
    try {
      if (resumeFile) await uploadResume(resumeFile)
      else if (removeResume) await deleteResume()

      onSaved(await updateProfile(formToPayload(values)))
    } catch (error) {
      const { message, fieldErrors } = parseApiError(error)
      setErrors(fieldErrors)
      setFormError(Object.keys(fieldErrors).length ? 'Please fix the highlighted fields and try again.' : message)
      focusFirstError()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6" noValidate>
      {formError && <Alert tone="error">{formError}</Alert>}

      <Card>
        <h2 className="text-lg font-semibold">Basic information</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <TextField label="Full name" name="name" autoComplete="name" value={values.name} onChange={handleField} error={errors.name} disabled={submitting} />
          <TextField label="Phone (optional)" name="phone" type="tel" autoComplete="tel" placeholder="+1 555 123 4567" value={values.phone} onChange={handleField} error={errors.phone} disabled={submitting} />
          <TextField label="Location (optional)" name="location" placeholder="City, Country" value={values.location} onChange={handleField} error={errors.location} disabled={submitting} />
          <div className="space-y-2 sm:col-span-2">
            <FileField
              label="Resume (optional)"
              accept={RESUME_ACCEPT}
              fileName={resumeFile ? resumeFile.name : savedResume?.originalName}
              onChange={handleResumeFile}
              error={errors.resume}
              hint={removeResume ? undefined : 'PDF, DOC or DOCX, up to 4MB. Used by default when you apply for jobs.'}
              disabled={submitting}
            />
            {removeResume ? (
              <p className="text-sm text-slate-500">
                Your resume will be removed when you save.{' '}
                <button
                  type="button"
                  className="font-medium text-brand-700 hover:underline disabled:pointer-events-none disabled:opacity-50"
                  onClick={handleUndoRemoveResume}
                  disabled={submitting}
                >
                  Undo
                </button>
              </p>
            ) : (
              (resumeFile || savedResume) && (
                <button
                  type="button"
                  className="text-sm font-medium text-red-700 hover:underline disabled:pointer-events-none disabled:opacity-50"
                  onClick={handleRemoveResume}
                  disabled={submitting}
                >
                  Remove resume
                </button>
              )
            )}
          </div>
          <TextField
            className="sm:col-span-2"
            label="Bio (optional)"
            name="bio"
            multiline
            rows={4}
            placeholder="A short summary of who you are and what you’re looking for."
            value={values.bio}
            onChange={handleField}
            error={errors.bio}
            hint={`${values.bio.length}/1000 characters`}
            disabled={submitting}
          />
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">Skills</h2>
        <TextField
          className="mt-5"
          label="Your skills"
          name="skills"
          placeholder="react, node, sql"
          value={values.skills}
          onChange={handleField}
          error={errors.skills}
          hint="Separate skills with commas. Up to 30."
          disabled={submitting}
        />
      </Card>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Education</h2>
          <Button variant="secondary" size="sm" disabled={submitting || values.education.length >= LIMITS.education} onClick={() => addEntry('education', emptyEducation)}>
            <PlusIcon className="h-4 w-4" />
            Add education
          </Button>
        </div>
        {values.education.length === 0 && <p className="mt-4 text-sm text-slate-500">No education added yet.</p>}
        <div className="mt-4 space-y-4">
          {values.education.map((entry, i) => (
            <div key={entry._key} className="rounded-lg border border-slate-200 p-4">
              <EntryHeader title={`Education ${i + 1}`} disabled={submitting} onRemove={() => removeEntry('education', i)} />
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <TextField label="Institution" value={entry.institution} onChange={handleEntry('education', i, 'institution')} error={errors[`education[${i}].institution`]} disabled={submitting} />
                <TextField label="Degree" placeholder="BSc, MSc, Diploma…" value={entry.degree} onChange={handleEntry('education', i, 'degree')} error={errors[`education[${i}].degree`]} disabled={submitting} />
                <TextField label="Field of study (optional)" value={entry.fieldOfStudy} onChange={handleEntry('education', i, 'fieldOfStudy')} error={errors[`education[${i}].fieldOfStudy`]} disabled={submitting} />
                <div className="grid grid-cols-2 gap-4">
                  <TextField label="Start year" type="number" inputMode="numeric" placeholder={String(thisYear - 4)} value={entry.startYear} onChange={handleEntry('education', i, 'startYear')} error={errors[`education[${i}].startYear`]} disabled={submitting} />
                  <TextField label="End year" type="number" inputMode="numeric" placeholder={String(thisYear)} value={entry.endYear} onChange={handleEntry('education', i, 'endYear')} error={errors[`education[${i}].endYear`]} disabled={submitting} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Experience</h2>
          <Button variant="secondary" size="sm" disabled={submitting || values.experience.length >= LIMITS.experience} onClick={() => addEntry('experience', emptyExperience)}>
            <PlusIcon className="h-4 w-4" />
            Add experience
          </Button>
        </div>
        {values.experience.length === 0 && <p className="mt-4 text-sm text-slate-500">No experience added yet.</p>}
        <div className="mt-4 space-y-4">
          {values.experience.map((entry, i) => (
            <div key={entry._key} className="rounded-lg border border-slate-200 p-4">
              <EntryHeader title={`Experience ${i + 1}`} disabled={submitting} onRemove={() => removeEntry('experience', i)} />
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <TextField label="Job title" value={entry.title} onChange={handleEntry('experience', i, 'title')} error={errors[`experience[${i}].title`]} disabled={submitting} />
                <TextField label="Company" value={entry.company} onChange={handleEntry('experience', i, 'company')} error={errors[`experience[${i}].company`]} disabled={submitting} />
                <TextField label="Start date" type="date" value={entry.startDate} onChange={handleEntry('experience', i, 'startDate')} error={errors[`experience[${i}].startDate`]} disabled={submitting} />
                <TextField label="End date (optional)" type="date" value={entry.endDate} onChange={handleEntry('experience', i, 'endDate')} error={errors[`experience[${i}].endDate`]} hint="Leave empty if this is your current job." disabled={submitting} />
                <TextField className="sm:col-span-2" label="Description (optional)" multiline rows={3} value={entry.description} onChange={handleEntry('experience', i, 'description')} error={errors[`experience[${i}].description`]} disabled={submitting} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" size="lg" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting && <Spinner className="h-4 w-4 text-white" />}
          {submitting ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </form>
  )
}
