import api from './api'
import { unwrapBlobError } from '../utils/apiError'

export const getMyApplicationForJob = async (jobId, { signal } = {}) => {
  const { data } = await api.get('/applications/mine', { params: { job: jobId, limit: 1 }, signal })
  return data.applications[0] ?? null
}

export const applyToJob = async (jobId, { resumeFile, coverLetter }) => {
  const form = new FormData()
  if (resumeFile) form.append('resume', resumeFile)
  if (coverLetter) form.append('coverLetter', coverLetter)

  const { data } = await api.post(`/jobs/${jobId}/applications`, form, { headers: { 'Content-Type': undefined } })
  return data.application
}

export const downloadApplicationResume = async (applicationId) => {
  try {
    const { data } = await api.get(`/applications/${applicationId}/resume`, { responseType: 'blob' })
    return data
  } catch (error) {
    await unwrapBlobError(error)
  }
}

export const getMyApplications = async ({ page = 1, limit = 10 } = {}, { signal } = {}) => {
  const { data } = await api.get('/applications/mine', { params: { page, limit }, signal })
  return { applications: data.applications, pagination: data.pagination }
}

export const withdrawApplication = async (id) => {
  const { data } = await api.patch(`/applications/${id}/withdraw`)
  return data.application
}

export const getJobApplications = async (jobId, { page = 1, limit = 10 } = {}, { signal } = {}) => {
  const { data } = await api.get(`/jobs/${jobId}/applications`, { params: { page, limit }, signal })
  return { applications: data.applications, pagination: data.pagination }
}

export const updateApplicationStatus = async (id, status) => {
  const { data } = await api.patch(`/applications/${id}/status`, { status })
  return data.application
}
