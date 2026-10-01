import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import { BriefcaseIcon, BuildingIcon, ChartIcon, ClipboardIcon, UserIcon, UsersIcon } from '../../components/ui/Icons'
import { useRequest } from '../../hooks/useRequest'
import { getAdminStats } from '../../services/adminService'
import { getRecruiterStatusLabel, getStatusInfo } from '../../utils/applications'

const BAR_COLOR = {
  neutral: 'bg-slate-400',
  brand: 'bg-brand-500',
  warning: 'bg-amber-500',
  success: 'bg-emerald-500',
  danger: 'bg-red-500',
}

function StatCard({ icon, label, value, note }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">{icon}</span>
      </div>
      <p className="mt-3 text-4xl font-bold text-slate-900">{value}</p>
      <p className="mt-2 min-h-5 text-sm text-slate-500">{note}</p>
    </Card>
  )
}

function Breakdown({ title, total, items }) {
  return (
    <Card>
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-slate-500">{total} total</p>
      </div>
      <ul className="mt-5 space-y-4">
        {items.map(({ label, count, tone }) => (
          <li key={label}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">{label}</span>
              <span className="tabular-nums text-slate-900">{count}</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100" role="presentation">
              <div className={`h-full rounded-full ${BAR_COLOR[tone]}`} style={{ width: total ? `${(count / total) * 100}%` : '0%' }} />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}

export default function AdminOverviewPage() {
  const stats = useRequest((signal) => getAdminStats({ signal }), 'admin-stats')

  if (stats.status === 'loading') {
    return (
      <div className="animate-pulse space-y-6" aria-hidden="true">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="h-40 rounded-xl border border-slate-200 bg-white" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-64 rounded-xl border border-slate-200 bg-white" />
          <div className="h-64 rounded-xl border border-slate-200 bg-white" />
        </div>
      </div>
    )
  }

  if (stats.status === 'error') {
    return (
      <div role="alert">
        <EmptyState
          icon={<ChartIcon />}
          title="We couldn’t load the platform overview"
          description={stats.error}
          action={<Button onClick={stats.retry}>Try again</Button>}
        />
      </div>
    )
  }

  const { users, companies, jobs, applications } = stats.data
  const jobItems = [
    { label: 'Open', count: jobs.byStatus.open, tone: 'success' },
    { label: 'Closed', count: jobs.byStatus.closed, tone: 'neutral' },
  ]
  const applicationItems = Object.entries(applications.byStatus).map(([status, count]) => ({
    label: getRecruiterStatusLabel(status),
    count,
    tone: getStatusInfo(status).tone,
  }))

  return (
    <div className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={<ChartIcon />} label="Total users" value={users.total} note={`${users.inactive} deactivated`} />
        <StatCard icon={<UserIcon />} label="Candidates" value={users.byRole.candidate} note="Looking for work" />
        <StatCard icon={<UsersIcon />} label="Recruiters" value={users.byRole.recruiter} note={`${users.byRole.admin} admin ${users.byRole.admin === 1 ? 'account' : 'accounts'}`} />
        <StatCard icon={<BuildingIcon />} label="Companies" value={companies} note="Company profiles" />
        <StatCard icon={<BriefcaseIcon />} label="Jobs" value={jobs.total} note={`${jobs.byStatus.open} open`} />
        <StatCard icon={<ClipboardIcon />} label="Applications" value={applications.total} note="Across all jobs" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Breakdown title="Jobs by status" total={jobs.total} items={jobItems} />
        <Breakdown title="Applications by status" total={applications.total} items={applicationItems} />
      </div>
    </div>
  )
}
