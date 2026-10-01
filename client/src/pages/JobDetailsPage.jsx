import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import ApplyPanel from '../components/ApplyPanel'
import { CompanyLogo } from '../components/JobCard'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Container from '../components/ui/Container'
import EmptyState from '../components/ui/EmptyState'
import { ArrowLeftIcon, BriefcaseIcon, MapPinIcon } from '../components/ui/Icons'
import { useRequest } from '../hooks/useRequest'
import { getJob } from '../services/jobService'
import { PATHS } from '../routes/paths'
import {
  formatDate,
  formatExperience,
  formatJobType,
  formatSalary,
  isExpired,
  timeAgo,
  timeUntil,
} from '../utils/jobs'

function BackLink() {
  return (
    <Link
      to={PATHS.jobs}
      className="inline-flex items-center gap-1.5 rounded text-sm font-medium text-slate-600 hover:text-brand-700"
    >
      <ArrowLeftIcon className="h-4 w-4" />
      Back to all jobs
    </Link>
  )
}

function DetailsSkeleton() {
  return (
    <Container className="py-8 sm:py-10" aria-busy="true">
      <span className="sr-only" role="status">
        Loading job…
      </span>
      <div className="animate-pulse" aria-hidden="true">
        <div className="h-4 w-32 rounded bg-slate-200" />
        <div className="mt-6 flex gap-4 rounded-xl border border-slate-200 bg-white p-6">
          <div className="h-16 w-16 rounded-lg bg-slate-200" />
          <div className="flex-1 space-y-3 pt-1">
            <div className="h-6 w-2/3 rounded bg-slate-200" />
            <div className="h-4 w-1/3 rounded bg-slate-100" />
            <div className="h-4 w-1/2 rounded bg-slate-100" />
          </div>
        </div>
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="order-last space-y-3 rounded-xl border border-slate-200 bg-white p-6 lg:order-none lg:col-span-2">
            <div className="h-5 w-40 rounded bg-slate-200" />
            {Array.from({ length: 7 }, (_, index) => (
              <div key={index} className="h-4 rounded bg-slate-100" style={{ width: `${95 - index * 6}%` }} />
            ))}
          </div>
          <div className="order-first h-72 rounded-xl border border-slate-200 bg-white lg:order-none" />
        </div>
      </div>
    </Container>
  )
}

function Fact({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 text-sm">
      <dt className="shrink-0 text-slate-500">{label}</dt>
      <dd className="min-w-0 text-right font-medium text-slate-900 wrap-anywhere">{children}</dd>
    </div>
  )
}

const websiteLabel = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export default function JobDetailsPage() {
  const { id } = useParams()
  const { status, data: job, error, errorStatus, retry } = useRequest((signal) => getJob(id, { signal }), id)

  useEffect(() => {
    if (!job) return undefined
    document.title = `${job.title} at ${job.company?.name ?? 'JobConnect'} | JobConnect`
    return () => {
      document.title = 'JobConnect'
    }
  }, [job])

  if (status === 'loading') return <DetailsSkeleton />

  if (status === 'error') {
    const unavailable = errorStatus === 404 || errorStatus === 400
    return (
      <Container className="py-8 sm:py-10">
        <BackLink />
        <div className="mt-6" role={unavailable ? undefined : 'alert'}>
          <EmptyState
            icon={<BriefcaseIcon />}
            title={unavailable ? 'This job isn’t available' : 'We couldn’t load this job'}
            description={
              unavailable ? 'It may have been filled, closed or removed by the employer.' : error
            }
            action={
              unavailable ? (
                <Button to={PATHS.jobs}>Browse other jobs</Button>
              ) : (
                <Button onClick={retry}>Try again</Button>
              )
            }
          />
        </div>
      </Container>
    )
  }

  const { company } = job
  const salary = formatSalary(job.salary)
  const experience = formatExperience(job.experienceYears)
  const expired = isExpired(job)
  const skills = job.skills ?? []

  return (
    <Container className="py-8 sm:py-10">
      <BackLink />

      <Card className="mt-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <CompanyLogo company={company} className="h-16 w-16 text-lg" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {job.status === 'closed' && <Badge tone="danger">Closed</Badge>}
              {expired && <Badge tone="warning">Deadline passed</Badge>}
            </div>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{job.title}</h1>
            <p className="mt-1 text-base font-medium text-slate-700">{company?.name ?? 'Company'}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <MapPinIcon className="h-4 w-4 text-slate-400" />
                {job.location}
              </span>
              <Badge tone="brand">{formatJobType(job.jobType)}</Badge>
              <span>Posted {timeAgo(job.createdAt)}</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <aside className="order-first lg:order-none lg:col-start-3 lg:row-start-1">
          <Card className="lg:sticky lg:top-24">
            <h2 className="text-sm font-medium text-slate-500">Salary</h2>
            <p className="mt-1 text-2xl font-bold text-slate-900">{salary ?? 'Not specified'}</p>

            <dl className="mt-4 divide-y divide-slate-100 border-t border-slate-100">
              <Fact label="Job type">{formatJobType(job.jobType)}</Fact>
              <Fact label="Location">{job.location}</Fact>
              {experience && <Fact label="Experience">{experience}</Fact>}
              <Fact label="Apply by">
                {job.deadline ? (
                  <>
                    {formatDate(job.deadline)}
                    {!expired && <span className="block text-xs font-normal text-slate-500">{timeUntil(job.deadline)}</span>}
                  </>
                ) : (
                  'No deadline'
                )}
              </Fact>
              <Fact label="Posted">{formatDate(job.createdAt)}</Fact>
            </dl>

            <div className="mt-5 border-t border-slate-100 pt-5">
              <ApplyPanel job={job} />
            </div>
          </Card>
        </aside>

        <div className="space-y-8 lg:col-span-2 lg:col-start-1 lg:row-start-1">
          <Card>
            <h2 className="text-lg font-semibold">About the role</h2>
            <p className="mt-4 whitespace-pre-line leading-relaxed text-slate-700 wrap-anywhere">{job.description}</p>
          </Card>

          {skills.length > 0 && (
            <Card>
              <h2 className="text-lg font-semibold">Skills</h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <li key={skill} className="rounded-md bg-slate-100 px-2.5 py-1 text-sm font-medium text-slate-700">
                    {skill}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {company && (
            <Card>
              <div className="flex items-center gap-3">
                <CompanyLogo company={company} />
                <div>
                  <h2 className="text-lg font-semibold">About {company.name}</h2>
                  {company.industry && <p className="text-sm text-slate-500">{company.industry}</p>}
                </div>
              </div>
              {company.description && (
                <p className="mt-4 whitespace-pre-line leading-relaxed text-slate-700 wrap-anywhere">{company.description}</p>
              )}
              <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
                {company.location && (
                  <div>
                    <dt className="inline text-slate-500">Headquarters: </dt>
                    <dd className="inline font-medium text-slate-900">{company.location}</dd>
                  </div>
                )}
                {company.website && (
                  <div>
                    <dt className="inline text-slate-500">Website: </dt>
                    <dd className="inline font-medium">
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-700 hover:text-brand-800 hover:underline"
                      >
                        {websiteLabel(company.website)}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </Card>
          )}
        </div>
      </div>
    </Container>
  )
}
