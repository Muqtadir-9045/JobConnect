import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import DashboardTabs from '../../components/DashboardTabs'
import Container from '../../components/ui/Container'
import PageHeader from '../../components/ui/PageHeader'
import { LoadingScreen } from '../../components/ui/Spinner'
import { useAuth } from '../../hooks/useAuth'
import { PATHS } from '../../routes/paths'

const tabs = [
  { to: PATHS.candidateApplications, label: 'My applications' },
  { to: PATHS.candidateProfile, label: 'My profile' },
]

export default function CandidateDashboard() {
  const { user } = useAuth()

  return (
    <>
      <PageHeader
        title="Candidate dashboard"
        description={`Welcome back, ${user?.name}. Track your applications and keep your profile up to date.`}
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
