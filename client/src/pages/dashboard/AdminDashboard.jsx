import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import DashboardTabs from '../../components/DashboardTabs'
import Container from '../../components/ui/Container'
import PageHeader from '../../components/ui/PageHeader'
import { LoadingScreen } from '../../components/ui/Spinner'
import { useAuth } from '../../hooks/useAuth'
import { PATHS } from '../../routes/paths'

const tabs = [
  { to: PATHS.adminDashboard, label: 'Overview', end: true },
  { to: PATHS.adminUsers, label: 'Users' },
  { to: PATHS.adminJobs, label: 'Jobs' },
  { to: PATHS.adminApplications, label: 'Applications' },
]

export default function AdminDashboard() {
  const { user } = useAuth()

  return (
    <>
      <PageHeader
        title="Admin dashboard"
        description={`Welcome back, ${user?.name}. Keep an eye on the platform and manage its users, jobs and applications.`}
      >
        <DashboardTabs tabs={tabs} />
      </PageHeader>
      <Container className="py-8 sm:py-10">
        <Suspense fallback={<LoadingScreen />}>
          <Outlet />
        </Suspense>
      </Container>
    </>
  )
}
