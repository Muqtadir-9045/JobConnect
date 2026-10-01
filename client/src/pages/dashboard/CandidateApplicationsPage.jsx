import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CompanyLogo } from '../../components/JobCard'
import Alert from '../../components/ui/Alert'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import { ClipboardIcon, MapPinIcon } from '../../components/ui/Icons'
import Pagination from '../../components/ui/Pagination'
import { Spinner } from '../../components/ui/Spinner'
import { useRequest } from '../../hooks/useRequest'
import { getMyApplications, withdrawApplication } from '../../services/applicationService'
import { PATHS } from '../../routes/paths'
import { parseApiError } from '../../utils/apiError'
import { canWithdraw, getStatusInfo } from '../../utils/applications'
import { formatDate, isExpired } from '../../utils/jobs'

const PAGE_SIZE = 10

function ApplicationsSkeleton() {
  return (
    <ul className="space-y-4" aria-hidden="true">
      {[0, 1, 2].map((item) => (
        <li key={item} className="flex animate-pulse gap-3 rounded-xl border border-slate-200 bg-white p-5">
          <div className="h-11 w-11 rounded-lg bg-slate-200" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-4 w-1/2 rounded bg-slate-200" />
            <div className="h-3 w-1/3 rounded bg-slate-100" />
            <div className="h-3 w-2/5 rounded bg-slate-100" />
          </div>
          <div className="h-6 w-24 rounded-full bg-slate-100" />
        </li>
      ))}
    </ul>
  )
}

function ApplicationRow({ application, confirming, withdrawing, onAskWithdraw, onCancel, onConfirm }) {
  const { job } = application
  const info = getStatusInfo(application.status)
  const jobOpen = job && job.status === 'open' && !isExpired(job)

  return (
    <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <CompanyLogo company={job?.company} />
          <div className="min-w-0">
            <h3 className="font-semibold leading-snug">
              {jobOpen ? (
                <Link to={PATHS.jobDetails(job._id)} className="hover:text-brand-700">
                  {job.title}
                </Link>
              ) : (
                (job?.title ?? 'This job is no longer available')
              )}
            </h3>
            {job?.company?.name && <p className="mt-0.5 text-sm text-slate-600">{job.company.name}</p>}
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
              {job?.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPinIcon className="h-4 w-4 text-slate-400" />
                  {job.location}
                </span>
              )}
              <span>Applied {formatDate(application.createdAt)}</span>
              {job && !jobOpen && <span className="text-amber-700">Job closed</span>}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 sm:items-end">
          <Badge tone={info.tone} className="px-3 py-1 text-sm">
            {info.label}
          </Badge>

          {canWithdraw(application.status) &&
            (confirming ? (
              <div role="group" aria-label="Confirm withdrawal" className="flex flex-col gap-2 sm:items-end">
                <p className="text-sm font-medium text-slate-700">Withdraw this application?</p>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={onCancel} disabled={withdrawing}>
                    Keep it
                  </Button>
                  <Button variant="danger" size="sm" onClick={onConfirm} disabled={withdrawing}>
                    {withdrawing && <Spinner className="h-4 w-4 text-white" />}
                    {withdrawing ? 'Withdrawing…' : 'Yes, withdraw'}
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="secondary" size="sm" onClick={onAskWithdraw}>
                Withdraw
              </Button>
            ))}
        </div>
      </div>

      {info.text && <p className="mt-4 border-t border-slate-100 pt-3 text-sm text-slate-600">{info.text}</p>}
    </li>
  )
}

export default function CandidateApplicationsPage() {
  const [page, setPage] = useState(1)
  const applications = useRequest(
    (signal) => getMyApplications({ page, limit: PAGE_SIZE }, { signal }),
    `my-applications:${page}`,
  )
  const [confirmingId, setConfirmingId] = useState(null)
  const [withdrawingId, setWithdrawingId] = useState(null)
  const [notice, setNotice] = useState(null)

  const goToPage = (next) => {
    setPage(next)
    setConfirmingId(null)
    setNotice(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleWithdraw = async (application) => {
    setWithdrawingId(application._id)
    setNotice(null)
    try {
      const updated = await withdrawApplication(application._id)
      const { data } = applications
      applications.setData({
        ...data,
        applications: data.applications.map((item) =>
          item._id === updated._id ? { ...item, status: updated.status, updatedAt: updated.updatedAt } : item,
        ),
      })
      setNotice({ tone: 'success', text: `Your application for “${application.job?.title ?? 'this job'}” was withdrawn.` })
    } catch (error) {
      const { message, status } = parseApiError(error)
      setNotice({ tone: 'error', text: message })
      if (status === 409 || status === 404) applications.retry()
    } finally {
      setWithdrawingId(null)
      setConfirmingId(null)
    }
  }

  let content
  if (applications.status === 'loading') {
    content = <ApplicationsSkeleton />
  } else if (applications.status === 'error') {
    content = (
      <div role="alert">
        <EmptyState
          icon={<ClipboardIcon />}
          title="We couldn’t load your applications"
          description={applications.error}
          action={<Button onClick={applications.retry}>Try again</Button>}
        />
      </div>
    )
  } else if (applications.data.pagination.total === 0) {
    content = (
      <EmptyState
        icon={<ClipboardIcon />}
        title="You haven’t applied to any jobs yet"
        description="When you apply, your applications and their status will show up here."
        action={<Button to={PATHS.jobs}>Browse jobs</Button>}
      />
    )
  } else if (applications.data.applications.length === 0) {
    content = (
      <EmptyState
        icon={<ClipboardIcon />}
        title="Nothing on this page"
        description="There are no applications this far down the list."
        action={<Button onClick={() => goToPage(1)}>Back to the first page</Button>}
      />
    )
  } else {
    const { applications: rows, pagination } = applications.data
    content = (
      <>
        <ul className="space-y-4">
          {rows.map((application) => (
            <ApplicationRow
              key={application._id}
              application={application}
              confirming={confirmingId === application._id}
              withdrawing={withdrawingId === application._id}
              onAskWithdraw={() => setConfirmingId(application._id)}
              onCancel={() => setConfirmingId(null)}
              onConfirm={() => handleWithdraw(application)}
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
          {applications.status === 'success' && applications.data.pagination.total > 0 && (
            <>
              <span className="font-semibold text-slate-900">{applications.data.pagination.total}</span>{' '}
              {applications.data.pagination.total === 1 ? 'application' : 'applications'}
            </>
          )}
        </p>
        <Button to={PATHS.jobs} variant="secondary" size="sm">
          Find more jobs
        </Button>
      </div>

      {notice && <Alert tone={notice.tone}>{notice.text}</Alert>}
      <div aria-busy={applications.status === 'loading'}>{content}</div>
    </div>
  )
}
