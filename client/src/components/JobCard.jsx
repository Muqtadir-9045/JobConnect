import { useState } from 'react'
import { Link } from 'react-router-dom'
import Badge from './ui/Badge'
import { MapPinIcon } from './ui/Icons'
import { PATHS } from '../routes/paths'
import { cn } from '../utils/cn'
import { formatJobType, formatSalary, formatShortDate, getInitials, timeAgo } from '../utils/jobs'

const MAX_SKILLS = 4

export function JobGrid({ children }) {
  return <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
}

export function CompanyLogo({ company, className = 'h-11 w-11' }) {
  const [failed, setFailed] = useState(false)

  if (company?.logoUrl && !failed) {
    return (
      <img
        src={company.logoUrl}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
        className={cn('shrink-0 rounded-lg bg-slate-100 object-cover', className)}
      />
    )
  }
  return (
    <div
      aria-hidden="true"
      className={cn(
        'flex shrink-0 items-center justify-center rounded-lg bg-brand-50 text-sm font-semibold text-brand-700',
        className,
      )}
    >
      {getInitials(company?.name) || '?'}
    </div>
  )
}

export default function JobCard({ job }) {
  const salary = formatSalary(job.salary)
  const skills = job.skills ?? []
  const extraSkills = skills.length - MAX_SKILLS

  return (
    <article className="relative flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-brand-600">
      <div className="flex items-start gap-3">
        <CompanyLogo company={job.company} />
        <div className="min-w-0">
          <h3 className="text-base font-semibold leading-snug">
            <Link to={PATHS.jobDetails(job._id)} className="after:absolute after:inset-0 after:content-[''] hover:text-brand-700">
              {job.title}
            </Link>
          </h3>
          <p className="mt-0.5 truncate text-sm text-slate-600">{job.company?.name ?? 'Company'}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <MapPinIcon className="h-4 w-4 shrink-0 text-slate-400" />
          {job.location}
        </span>
        <Badge tone="brand">{formatJobType(job.jobType)}</Badge>
      </div>

      {salary && <p className="mt-3 text-sm font-semibold text-slate-900">{salary}</p>}

      {skills.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Skills">
          {skills.slice(0, MAX_SKILLS).map((skill) => (
            <li key={skill} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
              {skill}
            </li>
          ))}
          {extraSkills > 0 && <li className="px-1 py-0.5 text-xs font-medium text-slate-500">+{extraSkills} more</li>}
        </ul>
      )}

      <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-xs text-slate-500">
        <span>Posted {timeAgo(job.createdAt)}</span>
        {job.deadline && <span>Closes {formatShortDate(job.deadline)}</span>}
      </div>
    </article>
  )
}

export function JobCardSkeleton() {
  return (
    <div className="flex h-full animate-pulse flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm" aria-hidden="true">
      <div className="flex items-start gap-3">
        <div className="h-11 w-11 shrink-0 rounded-lg bg-slate-200" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 w-3/4 rounded bg-slate-200" />
          <div className="h-3 w-1/2 rounded bg-slate-100" />
        </div>
      </div>
      <div className="mt-5 h-3 w-2/3 rounded bg-slate-100" />
      <div className="mt-4 h-4 w-1/2 rounded bg-slate-200" />
      <div className="mt-5 flex gap-2">
        <div className="h-5 w-14 rounded bg-slate-100" />
        <div className="h-5 w-16 rounded bg-slate-100" />
        <div className="h-5 w-12 rounded bg-slate-100" />
      </div>
      <div className="mt-8 h-3 w-1/3 rounded bg-slate-100" />
    </div>
  )
}
