import { createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../../services/api.js'

const STORAGE_KEY = 'boho_cart'

const readLocalItems = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

export const syncCartWithBackend = createAsyncThunk(
  'cart/syncWithBackend',
  async (userId, { rejectWithValue }) => {
    try {
      let cart
      try {
        const response = await api.get(`/cart/user/${userId}`)
        cart = response.data
      } catch (error) {
        if (error.status === 404) {
          const createResponse = await api.post(`/cart?userId=${userId}`)
          cart = createResponse.data
        } else {
          throw error
        }
      }

      const localItems = readLocalItems()
      const backendResponse = await api.get(`/cart-products/cart/${cart.idCart}`)
      const backendItems = backendResponse.data

      const backendByProduct = new Map(
        backendItems.map((entry) => [entry.product.idProduct, entry]),
      )

      for (const localItem of localItems) {
        const productId = localItem.product.idProduct
        const existing = backendByProduct.get(productId)
        const targetQty = Math.min(
          (existing?.quantity ?? 0) + localItem.quantity,
          localItem.product.stock,
        )

        if (existing) {
          const updated = await api.put(
            `/cart-products/${existing.idCartProduct}?quantity=${targetQty}`,
          )
          backendByProduct.set(productId, updated.data)
        } else {
          const created = await api.post(
            `/cart-products?cartId=${cart.idCart}&productId=${productId}&quantity=${targetQty}`,
          )
          backendByProduct.set(productId, created.data)
        }
      }

      if (localItems.length) {
        localStorage.removeItem(STORAGE_KEY)
      }

      const syncedResponse = await api.get(`/cart-products/cart/${cart.idCart}`)
      return {
        cartId: cart.idCart,
        items: syncedResponse.data,
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

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
