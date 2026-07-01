import { createSlice } from '@reduxjs/toolkit'
import {
  fetchProducts,
  fetchProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from './productThunks.js'

const initialState = {
  products: [],
  categories: [],
  currentProduct: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
}

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearProductError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchProducts
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.products = action.payload
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      
      // fetchProductById
      .addCase(fetchProductById.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.currentProduct = action.payload
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      
      // createProduct
      .addCase(createProduct.fulfilled, (state, action) => {
        state.products.push(action.payload)
      })
      
      // updateProduct
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex(p => p.idProduct === action.payload.idProduct)
        if (index !== -1) {
          state.products[index] = action.payload
        }
        if (state.currentProduct?.idProduct === action.payload.idProduct) {
          state.currentProduct = action.payload
        }
      })
      
      // deleteProduct
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(p => p.idProduct !== action.payload)
      })
      
      // fetchCategories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload
      })
      
      // createCategory
      .addCase(createCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload)
      })
      
      // updateCategory
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.categories.findIndex(c => c.idCategory === action.payload.idCategory)
        if (index !== -1) {
          state.categories[index] = action.payload
        }
      })
      
      // deleteCategory
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(c => c.idCategory !== action.payload)
      })
  }
})

export const { clearProductError } = productSlice.actions
export default productSlice.reducer
