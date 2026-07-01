import { createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../../services/api.js'

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      return response.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', { name, email, password, role: 'ROLE_USER' })
      return { ...response.data, name: response.data.name ?? name.trim() }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)
