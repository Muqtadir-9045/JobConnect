import Button from './ui/Button'
import EmptyState from './ui/EmptyState'
import Pagination from './ui/Pagination'

function TableSkeleton() {
  return (
    <div className="animate-pulse space-y-3 rounded-xl border border-slate-200 bg-white p-4" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((row) => (
        <div key={row} className="flex items-center gap-4">
          <div className="h-4 w-1/3 rounded bg-slate-200" />
          <div className="h-4 w-1/6 rounded bg-slate-100" />
          <div className="h-4 w-1/6 rounded bg-slate-100" />
          <div className="hidden h-4 w-1/6 rounded bg-slate-100 sm:block" />
        </div>
      ))}
    </div>
  )
}

export default function AdminTable({
  request,
  rows,
  pagination,
  columns,
  page,
  onPageChange,
  icon,
  errorTitle,
  emptyTitle,
  emptyText,
}) {
  if (request.status === 'loading') return <TableSkeleton />

  if (request.status === 'error') {
    return (
      <div role="alert">
        <EmptyState
          icon={icon}
          title={errorTitle}
          description={request.error}
          action={<Button onClick={request.retry}>Try again</Button>}
        />
      </div>
    )
  }

  if (pagination.total === 0) return <EmptyState icon={icon} title={emptyTitle} description={emptyText} />

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={icon}
        title="Nothing on this page"
        description="There are no results this far down the list."
        action={<Button onClick={() => onPageChange(1)}>Back to the first page</Button>}
      />
    )
  }

  const [primary, ...rest] = columns
  const actionsColumn = rest.find((column) => column.key === 'actions')
  const detailColumns = rest.filter((column) => column.key !== 'actions')

  return (
    <>
      <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm lg:block">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th key={column.key} scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row._id}>
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 align-top">
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 lg:hidden">
        {rows.map((row) => (
          <li key={row._id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            {primary.cell(row)}
            <dl className="mt-3 space-y-2 text-sm">
              {detailColumns.map((column) => (
                <div key={column.key} className="flex items-start justify-between gap-4">
                  <dt className="shrink-0 text-slate-500">{column.header}</dt>
                  <dd className="text-right">{column.cell(row)}</dd>
                </div>
              ))}
            </dl>
            {actionsColumn && <div className="mt-4 border-t border-slate-100 pt-3">{actionsColumn.cell(row)}</div>}
          </li>
        ))}
      </ul>

      <Pagination page={page} pages={pagination.pages} onPageChange={onPageChange} />
    </>
  )
}
