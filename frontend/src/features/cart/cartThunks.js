import { createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../../services/api.js'

export const getOrCreateCart = createAsyncThunk(
  'cart/getOrCreate',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/cart/user/${userId}`)
      return response.data
    } catch (error) {
      if (error.status === 404) {
        try {
          const createResponse = await api.post(`/cart?userId=${userId}`)
          return createResponse.data
        } catch (createError) {
          return rejectWithValue(createError.message)
        }
      }
      return rejectWithValue(error.message)
    }
  }
)

export const fetchCartItems = createAsyncThunk(
  'cart/fetchItems',
  async (cartId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/cart-products/cart/${cartId}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const addCartItem = createAsyncThunk(
  'cart/addItem',
  async ({ cartId, productId, quantity }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/cart-products?cartId=${cartId}&productId=${productId}&quantity=${quantity}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateCartItem = createAsyncThunk(
  'cart/updateItem',
  async ({ id, quantity }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/cart-products/${id}?quantity=${quantity}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const removeCartItem = createAsyncThunk(
  'cart/removeItem',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/cart-products/${id}`)
      return id
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)
