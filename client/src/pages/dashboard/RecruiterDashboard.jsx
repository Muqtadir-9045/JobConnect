import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import DashboardTabs from '../../components/DashboardTabs'
import Container from '../../components/ui/Container'
import PageHeader from '../../components/ui/PageHeader'
import { LoadingScreen } from '../../components/ui/Spinner'
import { useAuth } from '../../hooks/useAuth'
import { PATHS } from '../../routes/paths'

const tabs = [
  { to: PATHS.recruiterDashboard, label: 'Overview', end: true },
  { to: PATHS.recruiterJobs, label: 'My jobs' },
  { to: PATHS.recruiterCompany, label: 'Company profile' },
]

export default function RecruiterDashboard() {
  const { user } = useAuth()

  return (
    <>
      <PageHeader
        title="Recruiter dashboard"
        description={`Welcome back, ${user?.name}. See how your hiring is going and manage your jobs.`}
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
