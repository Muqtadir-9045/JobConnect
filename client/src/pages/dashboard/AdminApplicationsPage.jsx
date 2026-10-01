import { useState } from 'react'
import { Link } from 'react-router-dom'
import AdminTable from '../../components/AdminTable'
import Badge from '../../components/ui/Badge'
import TextField from '../../components/ui/TextField'
import { ClipboardIcon, DownloadIcon } from '../../components/ui/Icons'
import { Spinner } from '../../components/ui/Spinner'
import { useRequest } from '../../hooks/useRequest'
import { downloadApplicationResume } from '../../services/applicationService'
import { getAdminApplications } from '../../services/adminService'
import { PATHS } from '../../routes/paths'
import { parseApiError } from '../../utils/apiError'
import { APPLICATION_STATUS_INFO, getRecruiterStatusLabel, getStatusInfo } from '../../utils/applications'
import { saveBlob } from '../../utils/download'
import { formatDate } from '../../utils/jobs'

const PAGE_SIZE = 10
const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  ...Object.keys(APPLICATION_STATUS_INFO).map((status) => ({ value: status, label: getRecruiterStatusLabel(status) })),
]

function ResumeDownloadButton({ application }) {
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
    <div>
      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        className="inline-flex items-center gap-1.5 font-medium text-brand-700 hover:text-brand-800 hover:underline disabled:pointer-events-none disabled:opacity-50"
      >
        {downloading ? <Spinner className="h-4 w-4" /> : <DownloadIcon className="h-4 w-4" />}
        {downloading ? 'Downloading…' : 'Download'}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

export default function AdminApplicationsPage() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const applications = useRequest(
    (signal) => getAdminApplications({ page, limit: PAGE_SIZE, status }, { signal }),
    `admin-applications:${page}:${status}`,
  )

  const columns = [
    {
      key: 'candidate',
      header: 'Candidate',
      cell: (row) => (
        <div className="min-w-0">
          <p className="font-medium text-slate-900">{row.candidate?.name ?? 'Unknown candidate'}</p>
          <p className="break-all text-slate-500">{row.candidate?.email}</p>
        </div>
      ),
    },
    {
      key: 'job',
      header: 'Job',
      cell: (row) =>
        row.job ? (
          <div className="min-w-0">
            <Link to={PATHS.jobDetails(row.job._id)} className="font-medium text-slate-900 hover:text-brand-700">
              {row.job.title}
            </Link>
            {row.job.company?.name && <p className="text-slate-500">{row.job.company.name}</p>}
          </div>
        ) : (
          <span className="text-slate-400">Job removed</span>
        ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => <Badge tone={getStatusInfo(row.status).tone}>{getRecruiterStatusLabel(row.status)}</Badge>,
    },
    { key: 'applied', header: 'Applied', cell: (row) => <span className="text-slate-600">{formatDate(row.createdAt)}</span> },
    {
      key: 'resume',
      header: 'Resume',
      cell: (row) =>
        row.resume?.filename ? <ResumeDownloadButton application={row} /> : <span className="text-slate-400">—</span>,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <TextField
          className="w-full sm:w-48"
          label="Status"
          name="status"
          options={STATUS_OPTIONS}
          value={status}
          onChange={(event) => {
            setStatus(event.target.value)
            setPage(1)
          }}
        />
        <p className="pb-2.5 text-sm text-slate-600" aria-live="polite">
          {applications.status === 'success' && (
            <>
              <span className="font-semibold text-slate-900">{applications.data.pagination.total}</span>{' '}
              {applications.data.pagination.total === 1 ? 'application' : 'applications'}
            </>
          )}
        </p>
      </div>

      <AdminTable
        request={applications}
        rows={applications.data?.applications}
        pagination={applications.data?.pagination}
        columns={columns}
        page={page}
        onPageChange={(next) => {
          setPage(next)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
        icon={<ClipboardIcon />}
        errorTitle="We couldn’t load the applications"
        emptyTitle="No applications match this filter"
        emptyText="Try a different status."
      />
    </div>
  )
}
