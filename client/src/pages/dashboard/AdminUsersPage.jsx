import { useState } from 'react'
import AdminTable from '../../components/AdminTable'
import Alert from '../../components/ui/Alert'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import TextField from '../../components/ui/TextField'
import { UsersIcon } from '../../components/ui/Icons'
import { Spinner } from '../../components/ui/Spinner'
import { useAuth } from '../../hooks/useAuth'
import { useRequest } from '../../hooks/useRequest'
import { getAdminUsers, setUserActive } from '../../services/adminService'
import { parseApiError } from '../../utils/apiError'
import { formatDate } from '../../utils/jobs'

const PAGE_SIZE = 10
const ROLE_OPTIONS = [
  { value: '', label: 'All roles' },
  { value: 'candidate', label: 'Candidates' },
  { value: 'recruiter', label: 'Recruiters' },
  { value: 'admin', label: 'Admins' },
]
const STATUS_OPTIONS = [
  { value: '', label: 'All accounts' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Deactivated' },
]
const ROLE_TONE = { candidate: 'neutral', recruiter: 'brand', admin: 'warning' }

export default function AdminUsersPage() {
  const { user: me } = useAuth()
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({ role: '', status: '' })
  const users = useRequest(
    (signal) => getAdminUsers({ page, limit: PAGE_SIZE, ...filters }, { signal }),
    `admin-users:${page}:${filters.role}:${filters.status}`,
  )
  const [confirmingId, setConfirmingId] = useState(null)
  const [actingId, setActingId] = useState(null)
  const [notice, setNotice] = useState(null)

  const handleFilter = (event) => {
    const { name, value } = event.target
    setFilters((current) => ({ ...current, [name]: value }))
    setPage(1)
    setConfirmingId(null)
    setNotice(null)
  }

  const goToPage = (next) => {
    setPage(next)
    setConfirmingId(null)
    setNotice(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleToggle = async (target) => {
    const activate = target.isActive === false
    setActingId(target._id)
    setNotice(null)
    try {
      const updated = await setUserActive(target._id, activate)
      const { data } = users
      users.setData({
        ...data,
        users: data.users.map((item) => (item._id === updated._id ? { ...item, isActive: updated.isActive } : item)),
      })
      setNotice({ tone: 'success', text: `${target.name} was ${activate ? 'reactivated' : 'deactivated'}.` })
    } catch (error) {
      const { message, status } = parseApiError(error)
      setNotice({ tone: 'error', text: message })
      if (status === 404) users.retry()
    } finally {
      setActingId(null)
      setConfirmingId(null)
    }
  }

  const renderActions = (target) => {
    if (target._id === me?._id) return <span className="text-sm text-slate-400">This is you</span>

    const activate = target.isActive === false
    if (confirmingId !== target._id) {
      return (
        <Button variant={activate ? 'secondary' : 'dangerGhost'} size="sm" onClick={() => setConfirmingId(target._id)}>
          {activate ? 'Activate' : 'Deactivate'}
        </Button>
      )
    }

    const busy = actingId === target._id
    return (
      <div role="group" aria-label="Confirm account change" className="max-w-xs space-y-2">
        <p className="text-sm font-medium text-slate-700">
          {activate
            ? `Reactivate ${target.name}?`
            : `Deactivate ${target.name}? They are signed out immediately and can’t log in until reactivated.`}
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setConfirmingId(null)} disabled={busy}>
            Cancel
          </Button>
          <Button variant={activate ? 'primary' : 'danger'} size="sm" onClick={() => handleToggle(target)} disabled={busy}>
            {busy && <Spinner className="h-4 w-4 text-white" />}
            {busy ? 'Saving…' : 'Confirm'}
          </Button>
        </div>
      </div>
    )
  }

  const columns = [
    {
      key: 'name',
      header: 'User',
      cell: (row) => (
        <div className="min-w-0">
          <p className="font-medium text-slate-900">{row.name}</p>
          <p className="break-all text-slate-500">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      cell: (row) => <Badge tone={ROLE_TONE[row.role] ?? 'neutral'}>{row.role.charAt(0).toUpperCase() + row.role.slice(1)}</Badge>,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) =>
        row.isActive === false ? <Badge tone="danger">Deactivated</Badge> : <Badge tone="success">Active</Badge>,
    },
    { key: 'joined', header: 'Joined', cell: (row) => <span className="text-slate-600">{formatDate(row.createdAt)}</span> },
    { key: 'actions', header: 'Actions', cell: renderActions },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <TextField className="w-full sm:w-48" label="Role" name="role" options={ROLE_OPTIONS} value={filters.role} onChange={handleFilter} />
        <TextField className="w-full sm:w-48" label="Account status" name="status" options={STATUS_OPTIONS} value={filters.status} onChange={handleFilter} />
        <p className="pb-2.5 text-sm text-slate-600" aria-live="polite">
          {users.status === 'success' && (
            <>
              <span className="font-semibold text-slate-900">{users.data.pagination.total}</span>{' '}
              {users.data.pagination.total === 1 ? 'user' : 'users'}
            </>
          )}
        </p>
      </div>

      {notice && <Alert tone={notice.tone}>{notice.text}</Alert>}

      <AdminTable
        request={users}
        rows={users.data?.users}
        pagination={users.data?.pagination}
        columns={columns}
        page={page}
        onPageChange={goToPage}
        icon={<UsersIcon />}
        errorTitle="We couldn’t load the users"
        emptyTitle="No users match these filters"
        emptyText="Try a different role or account status."
      />
    </div>
  )
}
