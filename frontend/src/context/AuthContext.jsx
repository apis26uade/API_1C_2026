import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { login as apiLogin, register as apiRegister } from '../services/api.js'

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

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredAuth)

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(user))
      localStorage.setItem('boho_token', user.token)
    } else {
      localStorage.removeItem(AUTH_KEY)
      localStorage.removeItem('boho_token')
      localStorage.removeItem('boho_cart_id')
    }
  }, [user])

  const login = async (email, password) => {
    const response = await apiLogin(email, password)
    const session = {
      idUser: response.idUser,
      email: response.email,
      role: response.role,
      token: response.token,
    }
    setUser(session)
    return session
  }

  const register = async (name, email, password) => {
    const response = await apiRegister(name, email, password)
    const session = {
      idUser: response.idUser,
      email: response.email,
      role: response.role,
      token: response.token,
    }
    setUser(session)
    return session
  }

  const logout = () => setUser(null)

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user?.token),
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
