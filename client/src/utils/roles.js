import { PATHS } from '../routes/paths'

export const ROLES = Object.freeze({
  CANDIDATE: 'candidate',
  RECRUITER: 'recruiter',
  ADMIN: 'admin',
})

const DASHBOARD_BY_ROLE = {
  [ROLES.CANDIDATE]: PATHS.candidateDashboard,
  [ROLES.RECRUITER]: PATHS.recruiterDashboard,
  [ROLES.ADMIN]: PATHS.adminDashboard,
}

export const getDashboardPath = (role) => DASHBOARD_BY_ROLE[role] ?? PATHS.home
