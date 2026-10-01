import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import HomePage from '../pages/HomePage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import JobsPage from '../pages/JobsPage'
import JobDetailsPage from '../pages/JobDetailsPage'
import NotFoundPage from '../pages/NotFoundPage'
import GuestRoute from './GuestRoute'
import ProtectedRoute from './ProtectedRoute'
import ScrollToTop from './ScrollToTop'
import { PATHS } from './paths'
import { ROLES } from '../utils/roles'

const CandidateDashboard = lazy(() => import('../pages/dashboard/CandidateDashboard'))
const CandidateApplicationsPage = lazy(() => import('../pages/dashboard/CandidateApplicationsPage'))
const CandidateProfilePage = lazy(() => import('../pages/dashboard/CandidateProfilePage'))
const RecruiterDashboard = lazy(() => import('../pages/dashboard/RecruiterDashboard'))
const RecruiterOverviewPage = lazy(() => import('../pages/dashboard/RecruiterOverviewPage'))
const RecruiterJobsPage = lazy(() => import('../pages/dashboard/RecruiterJobsPage'))
const RecruiterJobNewPage = lazy(() => import('../pages/dashboard/RecruiterJobNewPage'))
const RecruiterJobEditPage = lazy(() => import('../pages/dashboard/RecruiterJobEditPage'))
const RecruiterApplicantsPage = lazy(() => import('../pages/dashboard/RecruiterApplicantsPage'))
const RecruiterCompanyPage = lazy(() => import('../pages/dashboard/RecruiterCompanyPage'))
const AdminDashboard = lazy(() => import('../pages/dashboard/AdminDashboard'))
const AdminOverviewPage = lazy(() => import('../pages/dashboard/AdminOverviewPage'))
const AdminUsersPage = lazy(() => import('../pages/dashboard/AdminUsersPage'))
const AdminJobsPage = lazy(() => import('../pages/dashboard/AdminJobsPage'))
const AdminApplicationsPage = lazy(() => import('../pages/dashboard/AdminApplicationsPage'))

export default function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path={PATHS.home} element={<HomePage />} />
          <Route path={PATHS.jobs} element={<JobsPage />} />
          <Route path={PATHS.jobDetails()} element={<JobDetailsPage />} />

          <Route element={<GuestRoute />}>
            <Route path={PATHS.login} element={<LoginPage />} />
            <Route path={PATHS.register} element={<RegisterPage />} />
          </Route>

          <Route element={<ProtectedRoute roles={[ROLES.CANDIDATE]} />}>
            <Route path={PATHS.candidateDashboard} element={<CandidateDashboard />}>
              <Route index element={<Navigate to={PATHS.candidateApplications} replace />} />
              <Route path="applications" element={<CandidateApplicationsPage />} />
              <Route path="profile" element={<CandidateProfilePage />} />
            </Route>
          </Route>
          <Route element={<ProtectedRoute roles={[ROLES.RECRUITER]} />}>
            <Route path={PATHS.recruiterDashboard} element={<RecruiterDashboard />}>
              <Route index element={<RecruiterOverviewPage />} />
              <Route path="jobs" element={<RecruiterJobsPage />} />
              <Route path="jobs/new" element={<RecruiterJobNewPage />} />
              <Route path="jobs/:id/edit" element={<RecruiterJobEditPage />} />
              <Route path="jobs/:id/applicants" element={<RecruiterApplicantsPage />} />
              <Route path="company" element={<RecruiterCompanyPage />} />
            </Route>
          </Route>
          <Route element={<ProtectedRoute roles={[ROLES.ADMIN]} />}>
            <Route path={PATHS.adminDashboard} element={<AdminDashboard />}>
              <Route index element={<AdminOverviewPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="jobs" element={<AdminJobsPage />} />
              <Route path="applications" element={<AdminApplicationsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  )
}
