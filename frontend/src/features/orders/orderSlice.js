import { createSlice } from '@reduxjs/toolkit'
import { fetchOrders, fetchUserOrders, createOrder, updateOrderStatus } from './orderThunks.js'

const initialState = {
  orders: [],
  userOrders: [],
  currentOrder: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
}

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchOrders
      .addCase(fetchOrders.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.orders = action.payload
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      
      // fetchUserOrders
      .addCase(fetchUserOrders.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.userOrders = action.payload
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      
      // createOrder
      .addCase(createOrder.fulfilled, (state, action) => {
        state.userOrders.push(action.payload)
        state.currentOrder = action.payload
      })
      
      // updateOrderStatus
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.orders.findIndex(o => o.idOrder === action.payload.idOrder)
        if (index !== -1) {
          state.orders[index] = {
            ...state.orders[index],
            status: action.payload.status,
          }
        }
      })
  }
})

export default orderSlice.reducer
