import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Alert from '../../components/ui/Alert'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import { BriefcaseIcon, MapPinIcon, PlusIcon } from '../../components/ui/Icons'
import Pagination from '../../components/ui/Pagination'
import { Spinner } from '../../components/ui/Spinner'
import { useRequest } from '../../hooks/useRequest'
import { deleteJob, getMyJobs } from '../../services/jobService'
import { PATHS } from '../../routes/paths'
import { parseApiError } from '../../utils/apiError'
import { formatDate, formatJobType, formatSalary, getJobStatus } from '../../utils/jobs'

const PAGE_SIZE = 10

function JobsSkeleton() {
  return (
    <ul className="space-y-4" aria-hidden="true">
      {[0, 1, 2].map((item) => (
        <li key={item} className="animate-pulse space-y-3 rounded-xl border border-slate-200 bg-white p-5">
          <div className="h-4 w-1/2 rounded bg-slate-200" />
          <div className="h-3 w-2/3 rounded bg-slate-100" />
          <div className="h-3 w-1/3 rounded bg-slate-100" />
        </li>
      ))}
    </ul>
  )
}

function JobRow({ job, confirming, deleting, onAskDelete, onCancel, onConfirm }) {
  const status = getJobStatus(job)
  const salary = formatSalary(job.salary)

  return (
    <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold leading-snug">
              <Link to={PATHS.jobDetails(job._id)} className="hover:text-brand-700">
                {job.title}
              </Link>
            </h3>
            <Badge tone={status.tone}>{status.label}</Badge>
          </div>
          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <MapPinIcon className="h-4 w-4 text-slate-400" />
              {job.location}
            </span>
            <span>{formatJobType(job.jobType)}</span>
            {salary && <span className="font-medium text-slate-900">{salary}</span>}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Posted {formatDate(job.createdAt)} · {job.deadline ? `Deadline ${formatDate(job.deadline)}` : 'No deadline'}
          </p>
        </div>

        <div className="flex flex-col gap-3 lg:items-end">
          {confirming ? (
            <div role="group" aria-label="Confirm deletion" className="flex flex-col gap-2 lg:items-end">
              <p className="text-sm font-medium text-slate-700">Delete this job? Its applications are deleted too.</p>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={onCancel} disabled={deleting}>
                  Keep it
                </Button>
                <Button variant="danger" size="sm" onClick={onConfirm} disabled={deleting}>
                  {deleting && <Spinner className="h-4 w-4 text-white" />}
                  {deleting ? 'Deleting…' : 'Yes, delete'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button to={PATHS.recruiterJobApplicants(job._id)} size="sm">
                Applicants
              </Button>
              <Button to={PATHS.jobDetails(job._id)} variant="secondary" size="sm">
                View job
              </Button>
              <Button to={PATHS.recruiterJobEdit(job._id)} variant="secondary" size="sm">
                Edit
              </Button>
              <Button variant="dangerGhost" size="sm" onClick={onAskDelete}>
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>
    </li>
  )
}

export default function RecruiterJobsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const jobs = useRequest((signal) => getMyJobs({ page, limit: PAGE_SIZE }, { signal }), `my-jobs:${page}`)
  const [confirmingId, setConfirmingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [notice, setNotice] = useState(() =>
    location.state?.notice ? { tone: 'success', text: location.state.notice } : null,
  )
  useEffect(() => {
    if (location.state?.notice) navigate(location.pathname, { replace: true, state: null })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const goToPage = (next) => {
    setPage(next)
    setConfirmingId(null)
    setNotice(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (job) => {
    setDeletingId(job._id)
    setNotice(null)
    try {
      await deleteJob(job._id)
      setNotice({ tone: 'success', text: `“${job.title}” was deleted.` })
      if (jobs.data.jobs.length === 1 && page > 1) setPage(page - 1)
      else jobs.retry()
    } catch (error) {
      const { message, status } = parseApiError(error)
      setNotice({ tone: 'error', text: message })
      if (status === 404) jobs.retry()
    } finally {
      setDeletingId(null)
      setConfirmingId(null)
    }
  }

  let content
  if (jobs.status === 'loading') {
    content = <JobsSkeleton />
  } else if (jobs.status === 'error') {
    content = (
      <div role="alert">
        <EmptyState
          icon={<BriefcaseIcon />}
          title="We couldn’t load your jobs"
          description={jobs.error}
          action={<Button onClick={jobs.retry}>Try again</Button>}
        />
      </div>
    )
  } else if (jobs.data.pagination.total === 0) {
    content = (
      <EmptyState
        icon={<BriefcaseIcon />}
        title="You haven’t posted any jobs yet"
        description="Jobs you post will be listed here, where you can view, edit or delete them."
        action={
          <Button to={PATHS.recruiterJobNew}>
            <PlusIcon className="h-4 w-4" />
            Post a job
          </Button>
        }
      />
    )
  } else if (jobs.data.jobs.length === 0) {
    content = (
      <EmptyState
        icon={<BriefcaseIcon />}
        title="Nothing on this page"
        description="There are no jobs this far down the list."
        action={<Button onClick={() => goToPage(1)}>Back to the first page</Button>}
      />
    )
  } else {
    const { jobs: rows, pagination } = jobs.data
    content = (
      <>
        <ul className="space-y-4">
          {rows.map((job) => (
            <JobRow
              key={job._id}
              job={job}
              confirming={confirmingId === job._id}
              deleting={deletingId === job._id}
              onAskDelete={() => setConfirmingId(job._id)}
              onCancel={() => setConfirmingId(null)}
              onConfirm={() => handleDelete(job)}
            />
          ))}
        </ul>
        <Pagination page={pagination.page} pages={pagination.pages} onPageChange={goToPage} />
      </>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600" aria-live="polite">
          {jobs.status === 'success' && jobs.data.pagination.total > 0 && (
            <>
              <span className="font-semibold text-slate-900">{jobs.data.pagination.total}</span>{' '}
              {jobs.data.pagination.total === 1 ? 'job' : 'jobs'}
            </>
          )}
        </p>
        <Button to={PATHS.recruiterJobNew} size="sm">
          <PlusIcon className="h-4 w-4" />
          Post a job
        </Button>
      </div>
      {notice && <Alert tone={notice.tone}>{notice.text}</Alert>}
      <div aria-busy={jobs.status === 'loading'}>{content}</div>
    </div>
  )
}
