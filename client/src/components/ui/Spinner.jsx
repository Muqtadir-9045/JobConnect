import { cn } from '../../utils/cn'

export function Spinner({ className }) {
  return (
    <svg
      className={cn('h-5 w-5 animate-spin text-brand-600', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )
}

export function LoadingScreen({ label = 'Loading…' }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center gap-3 text-slate-600" role="status">
      <Spinner className="h-6 w-6" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  )
}
