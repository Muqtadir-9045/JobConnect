import Button from './Button'
import { ArrowLeftIcon, ArrowRightIcon } from './Icons'

export default function Pagination({ page, pages, onPageChange }) {
  if (!pages || pages <= 1) return null

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-between gap-2 sm:gap-4">
      <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        <ArrowLeftIcon className="h-4 w-4" />
        Previous
      </Button>
      <p className="text-sm text-slate-600">
        Page <span className="font-semibold text-slate-900">{page}</span> of{' '}
        <span className="font-semibold text-slate-900">{pages}</span>
      </p>
      <Button variant="secondary" size="sm" disabled={page >= pages} onClick={() => onPageChange(page + 1)}>
        Next
        <ArrowRightIcon className="h-4 w-4" />
      </Button>
    </nav>
  )
}
