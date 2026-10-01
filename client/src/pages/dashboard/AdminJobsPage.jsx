import { useState } from 'react'
import { Link } from 'react-router-dom'
import AdminTable from '../../components/AdminTable'
import Alert from '../../components/ui/Alert'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import TextField from '../../components/ui/TextField'
import { BriefcaseIcon } from '../../components/ui/Icons'
import { Spinner } from '../../components/ui/Spinner'
import { useRequest } from '../../hooks/useRequest'
import { deleteAdminJob, getAdminJobs } from '../../services/adminService'
import { PATHS } from '../../routes/paths'
import { parseApiError } from '../../utils/apiError'
import { formatDate, formatJobType, getJobStatus } from '../../utils/jobs'
import { JOB_TYPE_OPTIONS } from '../../utils/jobForm'

const PAGE_SIZE = 10
const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
]
const TYPE_OPTIONS = [{ value: '', label: 'All job types' }, ...JOB_TYPE_OPTIONS]

export default function AdminJobsPage() {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({ status: '', jobType: '' })
  const jobs = useRequest(
    (signal) => getAdminJobs({ page, limit: PAGE_SIZE, ...filters }, { signal }),
    `admin-jobs:${page}:${filters.status}:${filters.jobType}`,
  )
  const [confirmingId, setConfirmingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [notice, setNotice] = useState(null)

  const handleFilter = (event) => {
    const { name, value } = event.target
    setFilters((current) => ({ ...current, [name]: value }))
    setPage(1)
    setConfirmingId(null)
    setNotice(null)
  }

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
      await deleteAdminJob(job._id)
      setNotice({ tone: 'success', text: `“${job.title}” and its applications were deleted.` })
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

  const renderActions = (job) => {
    if (confirmingId === job._id) {
      const busy = deletingId === job._id
      return (
        <div role="group" aria-label="Confirm deletion" className="max-w-xs space-y-2">
          <p className="text-sm font-medium text-slate-700">Delete this job? Its applications are deleted too.</p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setConfirmingId(null)} disabled={busy}>
              Keep it
            </Button>
            <Button variant="danger" size="sm" onClick={() => handleDelete(job)} disabled={busy}>
              {busy && <Spinner className="h-4 w-4 text-white" />}
              {busy ? 'Deleting…' : 'Yes, delete'}
            </Button>
          </div>
        </div>
      )
    }
    return (
      <div className="flex flex-wrap gap-2">
        <Button to={PATHS.jobDetails(job._id)} variant="secondary" size="sm">
          View
        </Button>
        <Button variant="dangerGhost" size="sm" onClick={() => setConfirmingId(job._id)}>
          Delete
        </Button>
      </div>
    )
  }

  const columns = [
    {
      key: 'title',
      header: 'Job',
      cell: (row) => (
        <div className="min-w-0">
          <Link to={PATHS.jobDetails(row._id)} className="font-medium text-slate-900 hover:text-brand-700">
            {row.title}
          </Link>
          <p className="text-slate-500">
            {[row.company?.name, row.location].filter(Boolean).join(' · ')}
          </p>
        </div>
      ),
    },
    {
      key: 'recruiter',
      header: 'Posted by',
      cell: (row) => (
        <div className="min-w-0">
          <p className="text-slate-900">{row.postedBy?.name ?? '—'}</p>
          <p className="break-all text-slate-500">{row.postedBy?.email}</p>
        </div>
      ),
    },
    { key: 'type', header: 'Type', cell: (row) => <span className="text-slate-700">{formatJobType(row.jobType)}</span> },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => {
        const status = getJobStatus(row)
        return <Badge tone={status.tone}>{status.label}</Badge>
      },
    },
    {
      key: 'posted',
      header: 'Posted',
      cell: (row) => (
        <div className="text-slate-600">
          <p>{formatDate(row.createdAt)}</p>
          <p className="text-xs text-slate-500">{row.deadline ? `Deadline ${formatDate(row.deadline)}` : 'No deadline'}</p>
        </div>
      ),
    },
    { key: 'actions', header: 'Actions', cell: renderActions },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <TextField className="w-full sm:w-48" label="Status" name="status" options={STATUS_OPTIONS} value={filters.status} onChange={handleFilter} />
        <TextField className="w-full sm:w-48" label="Job type" name="jobType" options={TYPE_OPTIONS} value={filters.jobType} onChange={handleFilter} />
        <p className="pb-2.5 text-sm text-slate-600" aria-live="polite">
          {jobs.status === 'success' && (
            <>
              <span className="font-semibold text-slate-900">{jobs.data.pagination.total}</span>{' '}
              {jobs.data.pagination.total === 1 ? 'job' : 'jobs'}
            </>
          )}
        </p>
      </div>

      {notice && <Alert tone={notice.tone}>{notice.text}</Alert>}

      <AdminTable
        request={jobs}
        rows={jobs.data?.jobs}
        pagination={jobs.data?.pagination}
        columns={columns}
        page={page}
        onPageChange={goToPage}
        icon={<BriefcaseIcon />}
        errorTitle="We couldn’t load the jobs"
        emptyTitle="No jobs match these filters"
        emptyText="Try a different status or job type."
      />
    </div>
  )
}
