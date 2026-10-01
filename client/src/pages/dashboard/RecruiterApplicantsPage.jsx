import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Alert from '../../components/ui/Alert'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import { ArrowLeftIcon, ClipboardIcon, DownloadIcon, MapPinIcon } from '../../components/ui/Icons'
import Pagination from '../../components/ui/Pagination'
import { Spinner } from '../../components/ui/Spinner'
import { useRequest } from '../../hooks/useRequest'
import { downloadApplicationResume, getJobApplications, updateApplicationStatus } from '../../services/applicationService'
import { getJob } from '../../services/jobService'
import { PATHS } from '../../routes/paths'
import { parseApiError } from '../../utils/apiError'
import { FINAL_DECISIONS, getRecruiterStatusLabel, getStatusInfo, nextStatuses } from '../../utils/applications'
import { saveBlob } from '../../utils/download'
import { formatDate, getInitials } from '../../utils/jobs'
import { summarizeEducation, summarizeExperience } from '../../utils/profile'

const PAGE_SIZE = 10
const MAX_SKILLS = 8

function ApplicantsSkeleton() {
  return (
    <ul className="space-y-4" aria-hidden="true">
      {[0, 1, 2].map((item) => (
        <li key={item} className="flex animate-pulse gap-3 rounded-xl border border-slate-200 bg-white p-5">
          <div className="h-11 w-11 shrink-0 rounded-full bg-slate-200" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-4 w-1/3 rounded bg-slate-200" />
            <div className="h-3 w-1/2 rounded bg-slate-100" />
            <div className="h-3 w-2/3 rounded bg-slate-100" />
          </div>
        </li>
      ))}
    </ul>
  )
}

function StatusControl({ application, name, busy, onChange }) {
  const [selected, setSelected] = useState('')
  const [confirming, setConfirming] = useState(false)
  const options = nextStatuses(application.status)

  if (options.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        {application.status === 'withdrawn' ? 'Withdrawn by the candidate.' : 'Final decision made.'}
      </p>
    )
  }

  const submit = async () => {
    await onChange(selected)
    setSelected('')
    setConfirming(false)
  }

  const handleUpdate = () => {
    if (FINAL_DECISIONS.includes(selected) && !confirming) setConfirming(true)
    else submit()
  }

  const selectId = `status-${application._id}`
  return (
    <div className="space-y-2">
      <label htmlFor={selectId} className="sr-only">
        Change status for {name}
      </label>
      <select
        id={selectId}
        value={selected}
        disabled={busy}
        onChange={(event) => {
          setSelected(event.target.value)
          setConfirming(false)
        }}
        className="block w-full rounded-lg border-0 bg-white px-3 py-2 text-base text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm"
      >
        <option value="">Move to…</option>
        {options.map((status) => (
          <option key={status} value={status}>
            {getRecruiterStatusLabel(status)}
          </option>
        ))}
      </select>

      {confirming ? (
        <div role="group" aria-label="Confirm final decision" className="space-y-2">
          <p className="text-sm font-medium text-slate-700">
            Mark as {getRecruiterStatusLabel(selected)}? This is final and can’t be undone.
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setConfirming(false)} disabled={busy}>
              Cancel
            </Button>
            <Button variant={selected === 'rejected' ? 'danger' : 'primary'} size="sm" onClick={handleUpdate} disabled={busy}>
              {busy && <Spinner className="h-4 w-4 text-white" />}
              {busy ? 'Saving…' : 'Confirm'}
            </Button>
          </div>
        </div>
      ) : (
        <Button size="sm" className="w-full" onClick={handleUpdate} disabled={!selected || busy}>
          {busy && <Spinner className="h-4 w-4 text-white" />}
          {busy ? 'Updating…' : 'Update status'}
        </Button>
      )}
    </div>
  )
}

function ResumeDownloadLink({ application }) {
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState('')

  const handleDownload = async () => {
    setDownloading(true)
    setError('')
    try {
      const blob = await downloadApplicationResume(application._id)
      saveBlob(blob, application.resume.originalName || 'resume')
    } catch (err) {
      setError(parseApiError(err).message)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline disabled:pointer-events-none disabled:opacity-50"
      >
        {downloading ? <Spinner className="h-4 w-4" /> : <DownloadIcon className="h-4 w-4" />}
        {downloading ? 'Downloading…' : `Download resume (${application.resume.originalName})`}
      </button>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}

function ApplicantCard({ application, busy, onChangeStatus }) {
  const candidate = application.candidate
  const name = candidate?.name ?? 'Unknown candidate'
  const info = getStatusInfo(application.status)
  const skills = candidate?.skills ?? []
  const education = summarizeEducation(candidate?.education)
  const experience = summarizeExperience(candidate?.experience)

  return (
    <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:justify-between">
        <div className="flex min-w-0 gap-3">
          <div
            aria-hidden="true"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700"
          >
            {getInitials(name) || '?'}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold">{name}</h3>
              <Badge tone={info.tone}>{getRecruiterStatusLabel(application.status)}</Badge>
            </div>

            <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
              {candidate?.email && (
                <a href={`mailto:${candidate.email}`} className="break-all text-brand-700 hover:underline">
                  {candidate.email}
                </a>
              )}
              {candidate?.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPinIcon className="h-4 w-4 text-slate-400" />
                  {candidate.location}
                </span>
              )}
              <span className="text-slate-500">Applied {formatDate(application.createdAt)}</span>
            </p>

            {skills.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Skills">
                {skills.slice(0, MAX_SKILLS).map((skill) => (
                  <li key={skill} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                    {skill}
                  </li>
                ))}
                {skills.length > MAX_SKILLS && (
                  <li className="px-1 py-0.5 text-xs font-medium text-slate-500">+{skills.length - MAX_SKILLS} more</li>
                )}
              </ul>
            )}

            <dl className="mt-3 space-y-1 text-sm">
              <div>
                <dt className="inline text-slate-500">Education: </dt>
                <dd className="inline text-slate-800">{education ?? <span className="text-slate-400">Not provided</span>}</dd>
              </div>
              <div>
                <dt className="inline text-slate-500">Experience: </dt>
                <dd className="inline text-slate-800">{experience ?? <span className="text-slate-400">Not provided</span>}</dd>
              </div>
            </dl>

            {application.resume?.filename ? (
              <ResumeDownloadLink application={application} />
            ) : (
              <p className="mt-3 text-sm text-slate-400">No resume on file</p>
            )}
          </div>
        </div>

        <div className="lg:w-56 lg:shrink-0">
          <StatusControl application={application} name={name} busy={busy} onChange={onChangeStatus} />
        </div>
      </div>
    </li>
  )
}

export default function RecruiterApplicantsPage() {
  const { id } = useParams()
  const [page, setPage] = useState(1)
  const job = useRequest((signal) => getJob(id, { signal }), `applicants-job:${id}`)
  const applicants = useRequest(
    (signal) => getJobApplications(id, { page, limit: PAGE_SIZE }, { signal }),
    `applicants:${id}:${page}`,
  )
  const [updatingId, setUpdatingId] = useState(null)
  const [notice, setNotice] = useState(null)

  const goToPage = (next) => {
    setPage(next)
    setNotice(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleChangeStatus = async (application, status) => {
    setUpdatingId(application._id)
    setNotice(null)
    try {
      const updated = await updateApplicationStatus(application._id, status)
      const { data } = applicants
      applicants.setData({
        ...data,
        applications: data.applications.map((item) =>
          item._id === updated._id ? { ...item, status: updated.status, updatedAt: updated.updatedAt } : item,
        ),
      })
      setNotice({
        tone: 'success',
        text: `${application.candidate?.name ?? 'The applicant'} is now ${getRecruiterStatusLabel(updated.status)}.`,
      })
    } catch (error) {
      const { message, status: code } = parseApiError(error)
      setNotice({ tone: 'error', text: message })
      if (code === 409 || code === 404) applicants.retry()
    } finally {
      setUpdatingId(null)
    }
  }

  const jobTitle = job.status === 'success' ? job.data.title : null

  let content
  if (applicants.status === 'loading') {
    content = <ApplicantsSkeleton />
  } else if (applicants.status === 'error') {
    const code = applicants.errorStatus
    const notYours = code === 403
    const missing = code === 404 || code === 400
    content = (
      <div role={notYours || missing ? undefined : 'alert'}>
        <EmptyState
          icon={<ClipboardIcon />}
          title={
            notYours ? 'You can only view applicants for your own jobs' : missing ? 'This job doesn’t exist' : 'We couldn’t load the applicants'
          }
          description={notYours ? 'This job was posted by someone else.' : missing ? 'It may have been deleted.' : applicants.error}
          action={
            notYours || missing ? <Button to={PATHS.recruiterJobs}>Back to my jobs</Button> : <Button onClick={applicants.retry}>Try again</Button>
          }
        />
      </div>
    )
  } else if (applicants.data.pagination.total === 0) {
    content = (
      <EmptyState
        icon={<ClipboardIcon />}
        title="No applicants yet"
        description="When candidates apply for this job, they will appear here."
        action={
          <Button to={PATHS.jobDetails(id)} variant="secondary">
            View job
          </Button>
        }
      />
    )
  } else if (applicants.data.applications.length === 0) {
    content = (
      <EmptyState
        icon={<ClipboardIcon />}
        title="Nothing on this page"
        description="There are no applicants this far down the list."
        action={<Button onClick={() => goToPage(1)}>Back to the first page</Button>}
      />
    )
  } else {
    const { applications: rows, pagination } = applicants.data
    content = (
      <>
        <ul className="space-y-4">
          {rows.map((application) => (
            <ApplicantCard
              key={application._id}
              application={application}
              busy={updatingId === application._id}
              onChangeStatus={(status) => handleChangeStatus(application, status)}
            />
          ))}
        </ul>
        <Pagination page={pagination.page} pages={pagination.pages} onPageChange={goToPage} />
      </>
    )
  }

  return (
    <div>
      <Link
        to={PATHS.recruiterJobs}
        className="inline-flex items-center gap-1.5 rounded text-sm font-medium text-slate-600 hover:text-brand-700"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back to my jobs
      </Link>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Applicants</h2>
          <p className="mt-1 text-slate-600">
            {jobTitle ? (
              <>
                for{' '}
                <Link to={PATHS.jobDetails(id)} className="font-medium text-brand-700 hover:underline">
                  {jobTitle}
                </Link>
              </>
            ) : (
              'for this job'
            )}
          </p>
        </div>
        <p className="text-sm text-slate-600" aria-live="polite">
          {applicants.status === 'success' && applicants.data.pagination.total > 0 && (
            <>
              <span className="font-semibold text-slate-900">{applicants.data.pagination.total}</span>{' '}
              {applicants.data.pagination.total === 1 ? 'applicant' : 'applicants'}
            </>
          )}
        </p>
      </div>

      {notice && (
        <Alert tone={notice.tone} className="mt-6">
          {notice.text}
        </Alert>
      )}
      <div className="mt-6" aria-busy={applicants.status === 'loading'}>
        {content}
      </div>
    </div>
  )
}
