import api from './api'
import { unwrapBlobError } from '../utils/apiError'

export const getProfile = async ({ signal } = {}) => {
  const { data } = await api.get('/candidates/me', { signal })
  return data.profile
}

export const updateProfile = async (changes) => {
  const { data } = await api.patch('/candidates/me', changes)
  return data.profile
}

export const uploadResume = async (file) => {
  const form = new FormData()
  form.append('resume', file)
  const { data } = await api.post('/candidates/me/resume', form, { headers: { 'Content-Type': undefined } })
  return data.profile
}

export const deleteResume = async () => {
  const { data } = await api.delete('/candidates/me/resume')
  return data.profile
}

export const downloadMyResume = async () => {
  try {
    const { data } = await api.get('/candidates/me/resume', { responseType: 'blob' })
    return data
  } catch (error) {
    await unwrapBlobError(error)
  }
}
