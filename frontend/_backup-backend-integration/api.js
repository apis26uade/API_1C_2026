import { categories, featuredProducts, normalizeProduct } from '../data/products.js'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

const getAuthHeaders = () => {
  const token = localStorage.getItem('boho_token') ?? localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const request = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers,
    },
  })

  if (!response.ok) {
    let message = `Error ${response.status}`
    try {
      const body = await response.json()
      message = body.message ?? body.error ?? message
    } catch {
      // ignore parse errors
    }
    throw new Error(message)
  }

  if (response.status === 204) return null
  return response.json()
}

export const login = (email, password) =>
  request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

export const register = (name, email, password) =>
  request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, role: 'ROLE_USER' }),
  })

export const getProducts = async () => {
  try {
    const products = await request('/products')
    return products.map((product, index) => normalizeProduct(product, index))
  } catch {
    return featuredProducts
  }
}

export const getProductById = async (id) => {
  try {
    const product = await request(`/products/${id}`)
    return normalizeProduct(product)
  } catch {
    return featuredProducts.find((product) => String(product.idProduct) === String(id))
  }
}

export const getCategories = async () => {
  try {
    const apiCategories = await request('/categories')
    return apiCategories.map((category, index) => ({
      idCategory: category.idCategory ?? category.id ?? index + 1,
      categoryName: category.categoryName ?? category.name ?? `Categoria ${index + 1}`,
    }))
  } catch {
    return categories
  }
}

export const getDiscountByCode = (code) => request(`/discounts/code/${encodeURIComponent(code)}`)

export const getOrCreateUserCart = async (userId) => {
  try {
    return await request(`/cart/user/${userId}`)
  } catch {
    return await request(`/cart?userId=${userId}`, { method: 'POST' })
  }
}

export const getCartItems = (cartId) => request(`/cart-products/cart/${cartId}`)

export const addCartItem = (cartId, productId, quantity) =>
  request(`/cart-products?cartId=${cartId}&productId=${productId}&quantity=${quantity}`, {
    method: 'POST',
  })

export const updateCartItem = (idCartProduct, quantity) =>
  request(`/cart-products/${idCartProduct}?quantity=${quantity}`, { method: 'PUT' })

export const removeCartItem = (idCartProduct) =>
  request(`/cart-products/${idCartProduct}`, { method: 'DELETE' })

export const createOrder = (userId, cartId, discountCode) => {
  const params = new URLSearchParams({
    userId: String(userId),
    cartId: String(cartId),
  })
  if (discountCode) params.set('discountCode', discountCode)
  return request(`/orders?${params.toString()}`, { method: 'POST' })
}

export const mapCartProduct = (cartProduct) => ({
  idCartProduct: cartProduct.idCartProduct,
  product: normalizeProduct(cartProduct.product),
  quantity: cartProduct.quantity,
  unitPrice: cartProduct.unitPrice ?? cartProduct.product?.price ?? 0,
})
