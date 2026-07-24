import { createAsyncThunk } from '@reduxjs/toolkit'
import { api, mapOrdersWithItems } from '../../services/api.js'

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/orders?includeItems=true')
      return mapOrdersWithItems(response.data)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchUserOrders = createAsyncThunk(
  'orders/fetchUserOrders',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/orders/user/${userId}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async ({ userId, cartId, discountCode, shipping }, { rejectWithValue }) => {
    try {
      const response = await api.post('/orders', {
        userId,
        cartId,
        discountCode: discountCode?.trim() || undefined,
        shipping,
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/orders/${id}/status?status=${encodeURIComponent(status)}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)
