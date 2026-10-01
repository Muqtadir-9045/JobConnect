import api, { cleanParams } from './api'

export const getAdminStats = async ({ signal } = {}) => {
  const { data } = await api.get('/admin/dashboard', { signal })
  return data.stats
}

export const getAdminUsers = async ({ page = 1, limit = 10, role, status } = {}, { signal } = {}) => {
  const { data } = await api.get('/admin/users', { params: cleanParams({ page, limit, role, status }), signal })
  return { users: data.users, pagination: data.pagination }
}

export const setUserActive = async (id, isActive) => {
  const { data } = await api.patch(`/admin/users/${id}/status`, { isActive })
  return data.user
}

export const getAdminJobs = async ({ page = 1, limit = 10, status, jobType } = {}, { signal } = {}) => {
  const { data } = await api.get('/admin/jobs', { params: cleanParams({ page, limit, status, jobType }), signal })
  return { jobs: data.jobs, pagination: data.pagination }
}

export const deleteAdminJob = async (id) => {
  await api.delete(`/admin/jobs/${id}`)
}

export const getAdminApplications = async ({ page = 1, limit = 10, status } = {}, { signal } = {}) => {
  const { data } = await api.get('/admin/applications', { params: cleanParams({ page, limit, status }), signal })
  return { applications: data.applications, pagination: data.pagination }
}
