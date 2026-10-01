import api from './api'

export const login = async ({ email, password }) => {
  const { data } = await api.post('/auth/login', { email, password })
  return data
}

export const register = async ({ name, email, password, role }) => {
  const { data } = await api.post('/auth/register', { name, email, password, role })
  return data
}

export const getCurrentUser = async () => {
  const { data } = await api.get('/auth/me')
  return data.user
}
