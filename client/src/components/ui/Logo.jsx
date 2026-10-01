import { Link } from 'react-router-dom'
import { PATHS } from '../../routes/paths'
import { cn } from '../../utils/cn'

export function LogoMark({ className = 'h-9 w-9' }) {
  return (
    <svg className={className} viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <rect width="36" height="36" rx="9" className="fill-brand-600" />
      <circle cx="12" cy="18" r="4" fill="#fff" />
      <circle cx="24" cy="18" r="4" fill="#fff" fillOpacity="0.75" />
      <path d="M15 18h6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

export default function Logo({ className, onClick }) {
  return (
    <Link
      to={PATHS.home}
      onClick={onClick}
      className={cn('inline-flex items-center gap-2.5 rounded-lg', className)}
      aria-label="JobConnect home"
    >
      <LogoMark />
      <span className="text-xl font-bold tracking-tight text-slate-900">
        Job<span className="text-brand-600">Connect</span>
      </span>
    </Link>
  )
}
