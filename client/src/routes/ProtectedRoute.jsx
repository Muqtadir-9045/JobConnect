import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { LoadingScreen } from '../components/ui/Spinner'
import { useAuth } from '../hooks/useAuth'
import { getDashboardPath } from '../utils/roles'
import { PATHS } from './paths'

export default function ProtectedRoute({ roles }) {
  const { status, isAuthenticated, role } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <LoadingScreen label="Checking your session…" />
  if (!isAuthenticated) return <Navigate to={PATHS.login} replace state={{ from: location }} />
  if (roles && !roles.includes(role)) return <Navigate to={getDashboardPath(role)} replace />

  return <Outlet />
}
