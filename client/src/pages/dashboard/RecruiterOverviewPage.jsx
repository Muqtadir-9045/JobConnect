import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import { ArrowRightIcon, BriefcaseIcon, PlusIcon } from '../../components/ui/Icons'
import { useRequest } from '../../hooks/useRequest'
import { getMyJobs } from '../../services/jobService'
import { PATHS } from '../../routes/paths'

const loadStats = async (signal) => {
  const [all, open] = await Promise.all([
    getMyJobs({ limit: 1 }, { signal }),
    getMyJobs({ limit: 1, status: 'open' }, { signal }),
  ])
  return { total: all.pagination.total, open: open.pagination.total }
}

function StatCard({ label, value, note }) {
  return (
    <Card>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-4xl font-bold text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{note}</p>
    </Card>
  )
}

export default function RecruiterOverviewPage() {
  const stats = useRequest(loadStats, 'recruiter-stats')

  if (stats.status === 'loading') {
    return (
      <div className="grid animate-pulse gap-6 sm:grid-cols-3" aria-hidden="true">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-36 rounded-xl border border-slate-200 bg-white" />
        ))}
      </div>
    )
  }

  if (stats.status === 'error') {
    return (
      <div role="alert">
        <EmptyState
          icon={<BriefcaseIcon />}
          title="We couldn’t load your numbers"
          description={stats.error}
          action={<Button onClick={stats.retry}>Try again</Button>}
        />
      </div>
    )
  }

  const { total, open } = stats.data
  if (total === 0) {
    return (
      <EmptyState
        icon={<BriefcaseIcon />}
        title="You haven’t posted any jobs yet"
        description="Once you post a job, your totals will appear here."
        action={
          <Button to={PATHS.recruiterJobNew}>
            <PlusIcon className="h-4 w-4" />
            Post a job
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-3">
        <StatCard label="Total jobs posted" value={total} note="Every job you have posted" />
        <StatCard label="Active jobs" value={open} note="Marked open for applications" />
        <StatCard label="Closed jobs" value={total - open} note="No longer accepting applications" />
      </div>
      <div className="flex flex-wrap gap-3">
        <Button to={PATHS.recruiterJobNew}>
          <PlusIcon className="h-4 w-4" />
          Post a job
        </Button>
        <Button to={PATHS.recruiterJobs} variant="secondary">
          Manage my jobs
          <ArrowRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
