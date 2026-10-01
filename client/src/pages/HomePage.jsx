import { Link, useNavigate } from 'react-router-dom'
import JobCard, { JobCardSkeleton, JobGrid } from '../components/JobCard'
import JobSearchForm from '../components/JobSearchForm'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Container from '../components/ui/Container'
import EmptyState from '../components/ui/EmptyState'
import {
  ArrowRightIcon,
  BriefcaseIcon,
  ChartIcon,
  ClipboardIcon,
  CodeIcon,
  DesignIcon,
  MegaphoneIcon,
  SearchIcon,
  UserIcon,
  UsersIcon,
} from '../components/ui/Icons'
import { useJobs } from '../hooks/useJobs'
import { PATHS } from '../routes/paths'
import { jobsPath } from '../utils/jobs'

const categories = [
  { icon: <CodeIcon />, title: 'Engineering', text: 'Software, backend, frontend and DevOps roles', q: 'engineer developer' },
  { icon: <ChartIcon />, title: 'Data & Analytics', text: 'Analysts, data engineers and ML specialists', q: 'data' },
  { icon: <DesignIcon />, title: 'Design', text: 'Product, UX and visual design', q: 'design' },
  { icon: <ClipboardIcon />, title: 'Product', text: 'Product management and strategy', q: 'product' },
  { icon: <MegaphoneIcon />, title: 'Marketing', text: 'Content, SEO and growth', q: 'marketing' },
  { icon: <UsersIcon />, title: 'Customer Success', text: 'Support and account management', q: 'customer' },
]

const steps = [
  {
    icon: <UserIcon />,
    title: 'Build your profile',
    text: 'Add your skills, experience and resume once, and reuse them for every application.',
  },
  {
    icon: <SearchIcon />,
    title: 'Find the right role',
    text: 'Filter open jobs by type, location, skills and salary to see what fits you.',
  },
  {
    icon: <ClipboardIcon />,
    title: 'Apply and follow up',
    text: 'Send your application and watch its status move from review to interview to offer.',
  },
]

function SectionHeading({ title, description, action }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-3xl font-bold">{title}</h2>
        {description && <p className="mt-2 text-slate-600">{description}</p>}
      </div>
      {action}
    </div>
  )
}

function RecentJobs() {
  const { status, jobs, error, retry } = useJobs({ limit: 6 })

  let content
  if (status === 'loading') {
    content = (
      <JobGrid>
        {Array.from({ length: 6 }, (_, index) => (
          <JobCardSkeleton key={index} />
        ))}
      </JobGrid>
    )
  } else if (status === 'error') {
    content = (
      <Alert tone="error" className="flex flex-wrap items-center justify-between gap-3">
        <span>We couldn’t load the latest jobs. {error}</span>
        <Button variant="secondary" size="sm" onClick={retry}>
          Try again
        </Button>
      </Alert>
    )
  } else if (jobs.length === 0) {
    content = (
      <EmptyState
        icon={<BriefcaseIcon />}
        title="No open jobs right now"
        description="New roles are added regularly, so check back soon."
      />
    )
  } else {
    content = (
      <JobGrid>
        {jobs.map((job) => (
          <JobCard key={job._id} job={job} />
        ))}
      </JobGrid>
    )
  }

  return (
    <section className="pb-14 sm:pb-20">
      <Container>
        <SectionHeading
          title="Latest jobs"
          description="Fresh openings from companies that are hiring now."
          action={
            <Button to={PATHS.jobs} variant="secondary">
              View all jobs
              <ArrowRightIcon className="h-4 w-4" />
            </Button>
          }
        />
        <div className="mt-8" aria-busy={status === 'loading'}>
          {content}
        </div>
      </Container>
    </section>
  )
}

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <>
      <section className="bg-gradient-to-b from-brand-50 to-white">
        <Container className="py-14 text-center sm:py-20">
          <p className="inline-flex items-center rounded-full bg-white px-3 py-1 text-sm font-medium text-brand-700 shadow-sm ring-1 ring-brand-100">
            Hiring, made simpler
          </p>
          <h1 className="mx-auto mt-6 max-w-3xl text-balance text-4xl font-bold sm:text-5xl lg:text-6xl">
            Find the job you want. <span className="text-brand-600">Hire the people you need.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            Search open roles from growing companies, apply in minutes and keep track of every application in one place.
          </p>

          <div className="mx-auto mt-10 max-w-3xl">
            <JobSearchForm onSubmit={(filters) => navigate(jobsPath(filters))} />
          </div>

          <p className="mt-6 text-sm text-slate-600">
            <Link to={PATHS.jobs} className="font-semibold text-brand-700 hover:text-brand-800">
              Browse all open jobs
            </Link>
            <span className="mx-2 text-slate-300" aria-hidden="true">
              |
            </span>
            Hiring?{' '}
            <Link to={PATHS.register} className="font-semibold text-brand-700 hover:text-brand-800">
              Post a job
            </Link>
          </p>
        </Container>
      </section>

      <section className="py-14 sm:py-16">
        <Container>
          <SectionHeading title="Popular categories" description="Jump straight to the kind of work you’re looking for." />
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map(({ icon, title, text, q }) => (
              <li key={title}>
                <Link
                  to={jobsPath({ q })}
                  className="group flex h-full items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    {icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-slate-900">{title}</span>
                    <span className="mt-0.5 block text-sm text-slate-600">{text}</span>
                  </span>
                  <ArrowRightIcon className="h-5 w-5 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-brand-600" />
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <RecentJobs />

      <section className="bg-white py-14 sm:py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold">How JobConnect works</h2>
            <p className="mt-3 text-slate-600">Three simple steps from sign-up to your next opportunity.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map(({ icon, title, text }, index) => (
              <Card key={title}>
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  {icon}
                </div>
                <p className="mt-5 text-sm font-semibold text-brand-700">Step {index + 1}</p>
                <h3 className="mt-1 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-slate-600">{text}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-14 sm:py-20">
        <Container>
          <div className="flex flex-col items-start gap-6 rounded-2xl bg-brand-700 px-6 py-10 text-white sm:px-12 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 sm:flex">
                <BriefcaseIcon />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Hiring? Reach candidates who fit.</h2>
                <p className="mt-2 max-w-xl text-brand-100">
                  Create your company profile, post roles and review applicants in a single dashboard.
                </p>
              </div>
            </div>
            <Button to={PATHS.register} variant="secondary" size="lg" className="w-full shrink-0 md:w-auto">
              Start hiring
            </Button>
          </div>
        </Container>
      </section>
    </>
  )
}
