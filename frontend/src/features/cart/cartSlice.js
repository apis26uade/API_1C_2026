import { createSlice } from '@reduxjs/toolkit'
import {
  syncCartWithBackend,
  getOrCreateCart,
  fetchCartItems,
  addCartItem,
  updateCartItem,
  removeCartItem,
} from './cartThunks.js'

const STORAGE_KEY = 'boho_cart'

const readLocalItems = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

const persistLocal = (items) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

const mapCartProduct = (entry) => ({
  idCartProduct: entry.idCartProduct,
  product: entry.product,
  quantity: entry.quantity,
  unitPrice: entry.unitPrice,
})

const initialState = {
  items: readLocalItems(),
  cartId: null,
  appliedDiscount: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  syncing: false,
  error: null,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addLocalItem: (state, action) => {
      const { product, quantity } = action.payload
      const existing = state.items.find(entry => entry.product.idProduct === product.idProduct)
      const targetQty = Math.min((existing?.quantity ?? 0) + quantity, product.stock)
      
      if (existing) {
        existing.quantity = targetQty
        existing.unitPrice = product.price
      } else {
        state.items.push({
          idCartProduct: `${product.idProduct}-${Date.now()}`,
          product,
          quantity: targetQty,
          unitPrice: product.price,
        })
      }
      persistLocal(state.items)
    },
    updateLocalItemQuantity: (state, action) => {
      const { idProduct, quantity } = action.payload
      const entry = state.items.find(item => item.product.idProduct === idProduct)
      if (entry) {
        entry.quantity = Math.max(1, Math.min(quantity, entry.product.stock))
        persistLocal(state.items)
      }
    },
    removeLocalItem: (state, action) => {
      const idProduct = action.payload
      state.items = state.items.filter(item => item.product.idProduct !== idProduct)
      persistLocal(state.items)
    },
    clearCart: (state) => {
      state.items = []
      state.appliedDiscount = null
      persistLocal([])
    },
    applyDiscount: (state, action) => {
      state.appliedDiscount = action.payload // { code, percentage }
    },
    clearDiscount: (state) => {
      state.appliedDiscount = null
    },
    setCartId: (state, action) => {
      state.cartId = action.payload
    },
    resetToLocalCart: (state) => {
      state.cartId = null
      state.items = readLocalItems()
      state.syncing = false
      state.appliedDiscount = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(syncCartWithBackend.pending, (state) => {
        state.syncing = true
        state.error = null
      })
      .addCase(syncCartWithBackend.fulfilled, (state, action) => {
        state.cartId = action.payload.cartId
        state.items = action.payload.items.map(mapCartProduct)
        state.syncing = false
      })
      .addCase(syncCartWithBackend.rejected, (state, action) => {
        state.syncing = false
        state.error = action.payload
        state.items = readLocalItems()
      })
      // getOrCreateCart
      .addCase(getOrCreateCart.pending, (state) => {
        state.syncing = true
        state.error = null
      })
      .addCase(getOrCreateCart.fulfilled, (state, action) => {
        state.cartId = action.payload.idCart
      })
      .addCase(getOrCreateCart.rejected, (state, action) => {
        state.syncing = false
        state.error = action.payload
      })
      
      // fetchCartItems
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.items = action.payload.map(mapCartProduct)
        state.syncing = false
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.syncing = false
        state.error = action.payload
      })
      
      // addCartItem
      .addCase(addCartItem.fulfilled, (state, action) => {
        state.items.push(mapCartProduct(action.payload))
      })
      
      // updateCartItem
      .addCase(updateCartItem.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.idCartProduct === action.payload.idCartProduct)
        if (index !== -1) {
          state.items[index] = mapCartProduct(action.payload)
        }
      })
      
      // removeCartItem
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.idCartProduct !== action.payload)
      })
  }
})

export const {
  addLocalItem,
  updateLocalItemQuantity,
  removeLocalItem,
  clearCart,
  applyDiscount,
  clearDiscount,
  setCartId,
  resetToLocalCart,
} = cartSlice.actions

export default cartSlice.reducer
