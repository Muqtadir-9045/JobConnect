import api from './api'

export const getMyCompany = async ({ signal } = {}) => {
  const { data } = await api.get('/companies/me', { signal })
  return data.company
}

export const createCompany = async (fields) => {
  const { data } = await api.post('/companies', fields)
  return data.company
}

export const updateCompany = async (id, changes) => {
  const { data } = await api.patch(`/companies/${id}`, changes)
  return data.company
}
