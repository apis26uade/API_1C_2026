import { createSlice } from '@reduxjs/toolkit'
import { loginUser, registerUser } from './authThunks.js'

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
  } else {
    localStorage.removeItem(AUTH_KEY)
    localStorage.removeItem('boho_token')
  }
}

const initialState = {
  user: readStoredAuth(),
  status: 'idle',
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.status = 'idle'
      state.error = null
      persistSession(null)
    },
    clearAuthError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload
        persistSession(action.payload)
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload
        persistSession(action.payload)
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
  },
})

export const { logout, clearAuthError } = authSlice.actions
export default authSlice.reducer
