import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { login as loginUser, register as registerUser } from '../services/api.js'

const AuthContext = createContext(null)
const AUTH_KEY = 'boho_auth'

const readStoredAuth = () => {
  try {
    const saved = localStorage.getItem(AUTH_KEY)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

const persistSession = (session) => {
  if (session?.token) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(session))
    localStorage.setItem('boho_token', session.token)
    return
  }
  localStorage.removeItem(AUTH_KEY)
  localStorage.removeItem('boho_token')
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredAuth)

  useEffect(() => {
    persistSession(user)
  }, [user])

  const login = async (email, password) => {
    const session = await loginUser(email, password)
    persistSession(session)
    setUser(session)
    return session
  }

  const register = async (name, email, password) => {
    const session = await registerUser(name, email, password)
    const nextUser = { ...session, name: session.name ?? name.trim() }
    persistSession(nextUser)
    setUser(nextUser)
    return nextUser
  }

  const logout = () => {
    persistSession(null)
    setUser(null)
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user?.token),
      isAdmin: user?.role === 'ROLE_ADMIN',
      login,
      register,
      logout,
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}
