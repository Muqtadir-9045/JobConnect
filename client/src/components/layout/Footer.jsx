import { Link } from 'react-router-dom'
import Container from '../ui/Container'
import Logo from '../ui/Logo'
import { useAuth } from '../../hooks/useAuth'
import { PATHS } from '../../routes/paths'
import { getDashboardPath } from '../../utils/roles'

const guestColumns = [
  {
    title: 'Candidates',
    links: [
      { to: PATHS.jobs, label: 'Browse jobs' },
      { to: PATHS.register, label: 'Create an account' },
      { to: PATHS.login, label: 'Log in' },
    ],
  },
  {
    title: 'Recruiters',
    links: [
      { to: PATHS.register, label: 'Start hiring' },
      { to: PATHS.login, label: 'Recruiter log in' },
    ],
  },
]

export default function Footer() {
  const { isAuthenticated, role } = useAuth()

  const columns = isAuthenticated
    ? [
        { title: 'Explore', links: [{ to: PATHS.jobs, label: 'Browse jobs' }] },
        { title: 'Your account', links: [{ to: getDashboardPath(role), label: 'Dashboard' }] },
      ]
    : guestColumns

  return (
    <footer className="border-t border-slate-200 bg-white">
      <Container className="py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm text-slate-600">
              JobConnect brings candidates and recruiters together: search open roles, apply in minutes and keep every
              application in one place.
            </p>
          </div>

          {columns.map(({ title, links }) => (
            <nav key={title} aria-label={title}>
              <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
              <ul className="mt-4 space-y-3">
                {links.map(({ to, label }) => (
                  <li key={label}>
                    <Link to={to} className="text-sm text-slate-600 hover:text-brand-700">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6 text-sm text-slate-500">
          © {new Date().getFullYear()} JobConnect. All rights reserved.
        </div>
      </Container>
    </footer>
  )
}
