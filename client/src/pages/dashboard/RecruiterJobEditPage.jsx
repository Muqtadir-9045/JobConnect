import { Link, useNavigate, useParams } from 'react-router-dom'
import JobForm from '../../components/JobForm'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import { ArrowLeftIcon, BriefcaseIcon } from '../../components/ui/Icons'
import { useAuth } from '../../hooks/useAuth'
import { useRequest } from '../../hooks/useRequest'
import { getJob } from '../../services/jobService'
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

export default function RecruiterJobEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const job = useRequest((signal) => getJob(id, { signal }), id)

  let content
  if (job.status === 'loading') {
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
  } else if (job.status === 'error') {
    const missing = job.errorStatus === 404 || job.errorStatus === 400
    content = (
      <div role={missing ? undefined : 'alert'}>
        <EmptyState
          icon={<BriefcaseIcon />}
          title={missing ? 'This job doesn’t exist' : 'We couldn’t load this job'}
          description={missing ? 'It may have been deleted.' : job.error}
          action={
            missing ? <Button to={PATHS.recruiterJobs}>Back to my jobs</Button> : <Button onClick={job.retry}>Try again</Button>
          }
        />
      </div>
    )
  } else if (job.data.postedBy !== user?._id) {
    content = (
      <EmptyState
        icon={<BriefcaseIcon />}
        title="You can only edit your own jobs"
        description="This job was posted by someone else."
        action={<Button to={PATHS.recruiterJobs}>Back to my jobs</Button>}
      />
    )
  } else {
    content = (
      <>
        <h2 className="mb-6 text-2xl font-bold">Edit “{job.data.title}”</h2>
        <JobForm
          job={job.data}
          onCancel={() => navigate(PATHS.recruiterJobs)}
          onSaved={(saved) => navigate(PATHS.recruiterJobs, { state: { notice: `“${saved.title}” was updated.` } })}
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
