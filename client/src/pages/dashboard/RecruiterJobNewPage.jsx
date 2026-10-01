import { Link, useNavigate } from 'react-router-dom'
import JobForm from '../../components/JobForm'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import { ArrowLeftIcon, BuildingIcon } from '../../components/ui/Icons'
import { useRequest } from '../../hooks/useRequest'
import { getMyCompany } from '../../services/companyService'
import { PATHS } from '../../routes/paths'

function BackLink() {
  return (
    <Link
      to={PATHS.recruiterJobs}
      className="inline-flex items-center gap-1.5 rounded text-sm font-medium text-slate-600 hover:text-brand-700"
    >
      <ArrowLeftIcon className="h-4 w-4" />
      Back to my jobs
    </Link>
  )
}

export default function RecruiterJobNewPage() {
  const navigate = useNavigate()
  const company = useRequest((signal) => getMyCompany({ signal }), 'my-company-for-new-job')

  let content
  if (company.status === 'loading') {
    content = (
      <div className="animate-pulse space-y-6" aria-hidden="true">
        {[6, 3, 4].map((lines, index) => (
          <div key={index} className="space-y-3 rounded-xl border border-slate-200 bg-white p-6">
            <div className="h-5 w-40 rounded bg-slate-200" />
            {Array.from({ length: lines }, (_, i) => (
              <div key={i} className="h-4 rounded bg-slate-100" style={{ width: `${92 - i * 7}%` }} />
            ))}
          </div>
        ))}
      </div>
    )
  } else if (company.status === 'error' && company.errorStatus !== 404) {
    content = (
      <div role="alert">
        <EmptyState
          icon={<BuildingIcon />}
          title="We couldn’t check your company profile"
          description={company.error}
          action={<Button onClick={company.retry}>Try again</Button>}
        />
      </div>
    )
  } else if (company.status === 'error') {
    content = (
      <EmptyState
        icon={<BuildingIcon />}
        title="Create your company profile first"
        description="Candidates see your company on every job you post, so add it before posting your first job."
        action={<Button to={PATHS.recruiterCompany}>Create company profile</Button>}
      />
    )
  } else {
    content = (
      <>
        <h2 className="mb-6 text-2xl font-bold">Post a new job</h2>
        <JobForm
          onCancel={() => navigate(PATHS.recruiterJobs)}
          onSaved={(saved) => navigate(PATHS.recruiterJobs, { state: { notice: `“${saved.title}” was posted.` } })}
        />
      </>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <BackLink />
      <div className="mt-6">{content}</div>
    </div>
  )
}
