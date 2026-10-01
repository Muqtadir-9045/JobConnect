import api, { cleanParams as clean } from './api'

export const getJobs = async (params = {}, { signal } = {}) => {
  const { data } = await api.get('/jobs', { params: clean(params), signal })
  return { jobs: data.jobs, pagination: data.pagination }
}

export const getJob = async (id, { signal } = {}) => {
  const { data } = await api.get(`/jobs/${id}`, { signal })
  return data.job
}

export const getMyJobs = async ({ page = 1, limit = 10, status } = {}, { signal } = {}) => {
  const { data } = await api.get('/jobs/mine', { params: clean({ page, limit, status }), signal })
  return { jobs: data.jobs, pagination: data.pagination }
}

export const updateJob = async (id, changes) => {
  const { data } = await api.patch(`/jobs/${id}`, changes)
  return data.job
}

export const deleteJob = async (id) => {
  await api.delete(`/jobs/${id}`)
}

export const createJob = async (fields) => {
  const { data } = await api.post('/jobs', fields)
  return data.job
}
