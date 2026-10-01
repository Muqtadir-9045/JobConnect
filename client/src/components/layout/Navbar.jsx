import { startTransition, useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import Button from '../ui/Button'
import Container from '../ui/Container'
import Logo from '../ui/Logo'
import { CloseIcon, MenuIcon } from '../ui/Icons'
import { useAuth } from '../../hooks/useAuth'
import { PATHS } from '../../routes/paths'
import { getDashboardPath } from '../../utils/roles'
import { cn } from '../../utils/cn'

const linkClass = ({ isActive }) =>
  cn(
    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  )

export default function Navbar() {
  const { user, role, status, isAuthenticated, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const close = () => setOpen(false)

  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event) => event.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  const handleLogout = () => {
    close()
    startTransition(() => {
      logout()
      navigate(PATHS.home)
    })
  }

  const links = [
    { to: PATHS.home, label: 'Home', end: true },
    { to: PATHS.jobs, label: 'Jobs' },
    ...(isAuthenticated ? [{ to: getDashboardPath(role), label: 'Dashboard' }] : []),
  ]

  const authActions =
    status === 'loading' ? (
      <div className="h-9 w-32 animate-pulse rounded-lg bg-slate-100" aria-hidden="true" />
    ) : isAuthenticated ? (
      <>
        <span className="truncate text-sm font-medium text-slate-600 md:max-w-[10rem]">{user?.name}</span>
        <Button variant="secondary" size="sm" onClick={handleLogout}>
          Log out
        </Button>
      </>
    ) : (
      <>
        <Button to={PATHS.login} variant="ghost" size="sm" onClick={close}>
          Log in
        </Button>
        <Button to={PATHS.register} size="sm" onClick={close}>
          Sign up
        </Button>
      </>
    )

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Logo onClick={close} />
          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {links.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end} className={linkClass}>
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-3 md:flex">{authActions}</div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </Container>

      <div id="mobile-menu" hidden={!open} className="border-t border-slate-200 bg-white md:hidden">
        <Container className="flex flex-col gap-1 py-3">
          <nav aria-label="Mobile" className="flex flex-col gap-1">
            {links.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end} className={linkClass} onClick={close}>
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-2 flex items-center gap-3 border-t border-slate-100 pt-3">{authActions}</div>
        </Container>
      </div>
    </header>
  )
}
