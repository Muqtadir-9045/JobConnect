import { NavLink } from 'react-router-dom'
import { cn } from '../utils/cn'

const tabClass = ({ isActive }) =>
  cn(
    'shrink-0 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  )

export default function DashboardTabs({ tabs }) {
  return (
    <nav aria-label="Dashboard sections" className="-m-1 flex gap-2 overflow-x-auto p-1">
      {tabs.map(({ to, label, end }) => (
        <NavLink key={to} to={to} end={end} className={tabClass}>
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
