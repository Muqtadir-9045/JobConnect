import { useState } from 'react'
import CompanyForm from '../../components/CompanyForm'
import { CompanyLogo } from '../../components/JobCard'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import { BuildingIcon, ExternalLinkIcon, PencilIcon } from '../../components/ui/Icons'
import { useAuth } from '../../hooks/useAuth'
import { useRequest } from '../../hooks/useRequest'
import { getMyCompany } from '../../services/companyService'
import { formatDate } from '../../utils/jobs'

function CompanySkeleton() {
  return (
    <div className="animate-pulse space-y-4 rounded-xl border border-slate-200 bg-white p-6" aria-hidden="true">
      <div className="flex gap-4">
        <div className="h-16 w-16 rounded-lg bg-slate-200" />
        <div className="flex-1 space-y-3 pt-1">
          <div className="h-5 w-1/3 rounded bg-slate-200" />
          <div className="h-4 w-1/4 rounded bg-slate-100" />
        </div>
      </div>
      {[90, 80, 60].map((width) => (
        <div key={width} className="h-4 rounded bg-slate-100" style={{ width: `${width}%` }} />
      ))}
    </div>
  )
}

function Detail({ label, children }) {
  return (
    <div className="min-w-0">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-900 wrap-anywhere">
        {children || <span className="font-normal text-slate-400">Not added</span>}
      </dd>
    </div>
  )
}

function CompanyDetails({ company }) {
  return (
    <Card>
      <div className="flex items-center gap-4">
        <CompanyLogo company={company} className="h-16 w-16 text-lg" />
        <div className="min-w-0">
          <h2 className="text-2xl font-bold">{company.name}</h2>
          {company.industry && <p className="text-slate-600">{company.industry}</p>}
        </div>
      </div>

      <dl className="mt-6 grid gap-5 border-t border-slate-100 pt-6 sm:grid-cols-2">
        <Detail label="Location">{company.location}</Detail>
        <Detail label="Website">
          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-brand-700 hover:text-brand-800 hover:underline"
            >
              {company.website}
              <ExternalLinkIcon className="h-4 w-4 shrink-0" />
            </a>
          )}
        </Detail>
        <Detail label="Logo URL">{company.logoUrl}</Detail>
        <Detail label="Created">{company.createdAt && formatDate(company.createdAt)}</Detail>
      </dl>

      <div className="mt-6 border-t border-slate-100 pt-6">
        <h3 className="text-sm text-slate-500">About the company</h3>
        {company.description ? (
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700 wrap-anywhere">{company.description}</p>
        ) : (
          <p className="mt-2 text-sm text-slate-400">Not added</p>
        )}
      </div>
    </Card>
  )
}

export default function RecruiterCompanyPage() {
  const { updateUser } = useAuth()
  const company = useRequest((signal) => getMyCompany({ signal }), 'my-company')
  const [editing, setEditing] = useState(false)
  const [notice, setNotice] = useState(null)

  if (company.status === 'loading') return <CompanySkeleton />

  if (company.status === 'error' && company.errorStatus !== 404) {
    return (
      <div role="alert">
        <EmptyState
          icon={<BuildingIcon />}
          title="We couldn’t load your company profile"
          description={company.error}
          action={<Button onClick={company.retry}>Try again</Button>}
        />
      </div>
    )
  }

  if (company.status === 'error') {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Create your company profile</h2>
          <p className="mt-1 text-slate-600">
            Tell candidates who you are. Your company appears on every job you post.
          </p>
        </div>
        <CompanyForm
          onSaved={(created) => {
            company.setData(created)
            updateUser({ company: created._id })
            setNotice('created')
          }}
        />
      </div>
    )
  }

  if (editing) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <h2 className="text-2xl font-bold">Edit company profile</h2>
        <CompanyForm
          company={company.data}
          onCancel={() => setEditing(false)}
          onSaved={(updated) => {
            company.setData(updated)
            setEditing(false)
            setNotice('updated')
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">This is how candidates see your company.</p>
        <Button
          onClick={() => {
            setNotice(null)
            setEditing(true)
          }}
        >
          <PencilIcon className="h-4 w-4" />
          Edit company
        </Button>
      </div>
      {notice && (
        <Alert tone="success">
          {notice === 'created' ? 'Your company profile was created.' : 'Your company profile was updated.'}
        </Alert>
      )}
      <CompanyDetails company={company.data} />
    </div>
  )
}
