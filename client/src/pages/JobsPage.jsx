import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import JobCard, { JobCardSkeleton, JobGrid } from '../components/JobCard'
import JobSearchForm from '../components/JobSearchForm'
import Button from '../components/ui/Button'
import Container from '../components/ui/Container'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import Pagination from '../components/ui/Pagination'
import { BriefcaseIcon, SearchIcon } from '../components/ui/Icons'
import { useJobs } from '../hooks/useJobs'
import { readFilters, toSearchParams } from '../utils/jobs'

const PAGE_SIZE = 9

export default function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = useMemo(() => readFilters(searchParams), [searchParams])
  const { status, jobs, pagination, error, retry } = useJobs({ ...filters, limit: PAGE_SIZE })

  const hasFilters = Boolean(filters.q || filters.location || filters.jobType)
  const applyFilters = (next) => setSearchParams(toSearchParams(next))
  const handleSearch = (values) => applyFilters({ ...values, page: 1 })
  const clearFilters = () => setSearchParams({})
  const goToPage = (page) => {
    applyFilters({ ...filters, page })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  let content
  if (status === 'loading') {
    content = (
      <JobGrid>
        {Array.from({ length: PAGE_SIZE }, (_, index) => (
          <JobCardSkeleton key={index} />
        ))}
      </JobGrid>
    )
  } else if (status === 'error') {
    content = (
      <div role="alert">
        <EmptyState
          icon={<BriefcaseIcon />}
          title="We couldn’t load jobs"
          description={error}
          action={<Button onClick={retry}>Try again</Button>}
        />
      </div>
    )
  } else if (jobs.length === 0 && pagination.total > 0) {
    content = (
      <EmptyState
        icon={<SearchIcon />}
        title="That page doesn’t exist"
        description="There are no results this far down the list."
        action={<Button onClick={() => goToPage(1)}>Go to the first page</Button>}
      />
    )
  } else if (jobs.length === 0) {
    content = (
      <EmptyState
        icon={<SearchIcon />}
        title={hasFilters ? 'No jobs match your search' : 'No open jobs right now'}
        description={
          hasFilters
            ? 'Try different keywords, a broader location or another job type.'
            : 'New roles are added regularly, so check back soon.'
        }
        action={hasFilters ? <Button onClick={clearFilters}>Clear filters</Button> : null}
      />
    )
  } else {
    content = (
      <>
        <JobGrid>
          {jobs.map((job) => (
            <JobCard key={job._id} job={job} />
          ))}
        </JobGrid>
        <Pagination page={pagination.page} pages={pagination.pages} onPageChange={goToPage} />
      </>
    )
  }

  return (
    <>
      <PageHeader title="Find your next job" description="Search open roles by keyword, location and job type.">
        <JobSearchForm
          key={`${filters.q}|${filters.location}|${filters.jobType}`}
          initialValues={filters}
          onSubmit={handleSearch}
          showJobType
        />
      </PageHeader>

      <Container className="py-8 sm:py-10">
        <div className="mb-6 flex min-h-9 flex-wrap items-center justify-between gap-3" aria-live="polite">
          <p className="text-sm text-slate-600">
            {status === 'loading' && 'Loading jobs…'}
            {status === 'success' && (
              <>
                <span className="font-semibold text-slate-900">{pagination.total}</span>{' '}
                {pagination.total === 1 ? 'job' : 'jobs'} found
              </>
            )}
          </p>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>

        <h2 className="sr-only">Job results</h2>
        <div aria-busy={status === 'loading'}>{content}</div>
      </Container>
    </>
  )
}
