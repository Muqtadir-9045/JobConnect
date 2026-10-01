import { useState } from 'react'
import ProfileForm from '../../components/ProfileForm'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import { DownloadIcon, PencilIcon, UserIcon } from '../../components/ui/Icons'
import { Spinner } from '../../components/ui/Spinner'
import { useAuth } from '../../hooks/useAuth'
import { useRequest } from '../../hooks/useRequest'
import { downloadMyResume, getProfile } from '../../services/candidateService'
import { parseApiError } from '../../utils/apiError'
import { saveBlob } from '../../utils/download'
import { formatMonthYear } from '../../utils/profile'

const NOT_ADDED = <span className="font-normal text-slate-400">Not added</span>

function Detail({ label, children }) {
  return (
    <div className="min-w-0">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-900 wrap-anywhere">{children || NOT_ADDED}</dd>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-hidden="true">
      {[5, 3, 4].map((lines, index) => (
        <div key={index} className="space-y-3 rounded-xl border border-slate-200 bg-white p-6">
          <div className="h-5 w-40 rounded bg-slate-200" />
          {Array.from({ length: lines }, (_, i) => (
            <div key={i} className="h-4 rounded bg-slate-100" style={{ width: `${90 - i * 8}%` }} />
          ))}
        </div>
      ))}
    </div>
  )
}

function ResumeDownloadButton({ resume }) {
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState('')

  const handleDownload = async () => {
    setDownloading(true)
    setError('')
    try {
      const blob = await downloadMyResume()
      saveBlob(blob, resume.originalName || 'resume')
    } catch (err) {
      setError(parseApiError(err).message)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline disabled:pointer-events-none disabled:opacity-50"
      >
        {downloading ? <Spinner className="h-4 w-4" /> : <DownloadIcon className="h-4 w-4" />}
        {downloading ? 'Downloading…' : `Download resume (${resume.originalName})`}
      </button>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}

function ProfileView({ profile }) {
  const { education = [], experience = [], skills = [] } = profile

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-lg font-semibold">Personal details</h2>
        <dl className="mt-5 grid gap-5 sm:grid-cols-2">
          <Detail label="Full name">{profile.name}</Detail>
          <Detail label="Email">{profile.email}</Detail>
          <Detail label="Phone">{profile.phone}</Detail>
          <Detail label="Location">{profile.location}</Detail>
          <Detail label="Resume">{profile.resume && <ResumeDownloadButton resume={profile.resume} />}</Detail>
        </dl>
        <div className="mt-5 border-t border-slate-100 pt-5">
          <h3 className="text-sm text-slate-500">About me</h3>
          {profile.bio ? (
            <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-slate-700 wrap-anywhere">{profile.bio}</p>
          ) : (
            <p className="mt-1 text-sm text-slate-400">Not added</p>
          )}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">Skills</h2>
        {skills.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <li key={skill} className="rounded-md bg-slate-100 px-2.5 py-1 text-sm font-medium text-slate-700">
                {skill}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-slate-400">No skills added yet.</p>
        )}
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">Education</h2>
        {education.length > 0 ? (
          <ul className="mt-4 divide-y divide-slate-100">
            {education.map((item, index) => (
              <li key={index} className="py-3 first:pt-0 last:pb-0">
                <p className="font-medium text-slate-900">{item.institution}</p>
                <p className="text-sm text-slate-600">{[item.degree, item.fieldOfStudy].filter(Boolean).join(' · ')}</p>
                {(item.startYear || item.endYear) && (
                  <p className="text-sm text-slate-500">{[item.startYear, item.endYear].filter(Boolean).join(' – ')}</p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-slate-400">No education added yet.</p>
        )}
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">Experience</h2>
        {experience.length > 0 ? (
          <ul className="mt-4 divide-y divide-slate-100">
            {experience.map((item, index) => (
              <li key={index} className="py-3 first:pt-0 last:pb-0">
                <p className="font-medium text-slate-900">{item.title}</p>
                <p className="text-sm text-slate-600">{item.company}</p>
                <p className="text-sm text-slate-500">
                  {formatMonthYear(item.startDate)} – {item.endDate ? formatMonthYear(item.endDate) : 'Present'}
                </p>
                {item.description && (
                  <p className="mt-2 whitespace-pre-line text-sm text-slate-700 wrap-anywhere">{item.description}</p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-slate-400">No experience added yet.</p>
        )}
      </Card>
    </div>
  )
}

function ProfileContent() {
  const { updateUser } = useAuth()
  const profile = useRequest((signal) => getProfile({ signal }), 'my-profile')
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)

  if (profile.status === 'loading') return <ProfileSkeleton />

  if (profile.status === 'error') {
    return (
      <div role="alert">
        <EmptyState
          icon={<UserIcon />}
          title="We couldn’t load your profile"
          description={profile.error}
          action={<Button onClick={profile.retry}>Try again</Button>}
        />
      </div>
    )
  }

  if (editing) {
    return (
      <ProfileForm
        profile={profile.data}
        onCancel={() => setEditing(false)}
        onSaved={(updated) => {
          profile.setData(updated)
          updateUser(updated)
          setEditing(false)
          setSaved(true)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">This is what recruiters see when you apply.</p>
        <Button
          onClick={() => {
            setSaved(false)
            setEditing(true)
          }}
        >
          <PencilIcon className="h-4 w-4" />
          Edit profile
        </Button>
      </div>
      {saved && <Alert tone="success">Your profile was updated.</Alert>}
      <ProfileView profile={profile.data} />
    </div>
  )
}

export default function CandidateProfilePage() {
  return (
    <div className="mx-auto max-w-3xl">
      <ProfileContent />
    </div>
  )
}
