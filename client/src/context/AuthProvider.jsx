import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './AuthContext'
import { setUnauthorizedHandler } from '../services/api'
import * as authService from '../services/authService'
import { tokenStorage } from '../services/tokenStorage'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => tokenStorage.get())
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState(() => (tokenStorage.get() ? 'loading' : 'unauthenticated'))

  const logout = useCallback(() => {
    tokenStorage.clear()
    setToken(null)
    setUser(null)
    setStatus('unauthenticated')
  }, [])

  const startSession = useCallback(({ token: newToken, user: newUser }) => {
    tokenStorage.set(newToken)
    setToken(newToken)
    setUser(newUser)
    setStatus('authenticated')
    return newUser
  }, [])

  const updateUser = useCallback((changes) => setUser((current) => (current ? { ...current, ...changes } : current)), [])

  const login = useCallback(async (credentials) => startSession(await authService.login(credentials)), [startSession])
  const register = useCallback(async (details) => startSession(await authService.register(details)), [startSession])

  useEffect(() => {
    setUnauthorizedHandler(logout)
    return () => setUnauthorizedHandler(null)
  }, [logout])

  useEffect(() => {
    if (!tokenStorage.get()) return undefined
    let cancelled = false
    authService
      .getCurrentUser()
      .then((currentUser) => {
        if (cancelled) return
        setUser(currentUser)
        setStatus('authenticated')
      })
      .catch((error) => {
        if (cancelled) return
        if (error.response?.status !== 401) setStatus('unauthenticated')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      status,
      isAuthenticated: status === 'authenticated',
      role: user?.role ?? null,
      login,
      register,
      logout,
      updateUser,
    }),
    [user, token, status, login, register, logout, updateUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
