import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice.js'
import productReducer from '../features/products/productSlice.js'
import cartReducer from '../features/cart/cartSlice.js'
import orderReducer from '../features/orders/orderSlice.js'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    cart: cartReducer,
    orders: orderReducer,
  },
})

export default store
