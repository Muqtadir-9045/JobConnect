import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { LoadingScreen } from '../components/ui/Spinner'
import { useAuth } from '../hooks/useAuth'
import { getDashboardPath } from '../utils/roles'

export default function GuestRoute() {
  const { status, isAuthenticated, role } = useAuth()
  const from = useLocation().state?.from

  if (status === 'loading') return <LoadingScreen label="Checking your session…" />
  if (!isAuthenticated) return <Outlet />

  const target = /^\/(?!\/)/.test(from?.pathname ?? '')
    ? `${from.pathname}${from.search ?? ''}${from.hash ?? ''}`
    : getDashboardPath(role)
  return <Navigate to={target} replace />
}
