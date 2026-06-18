const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

const getToken = () => localStorage.getItem('boho_token')

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function parseErrorBody(res) {
  try {
    const body = await res.json()
    return body.error ?? body.message ?? `Error ${res.status}`
  } catch {
    return `Error ${res.status}`
  }
}

export async function apiFetch(path, options = {}) {
  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    ...options.headers,
  }

  let res
  try {
    res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
  } catch {
    throw new ApiError(
      'No se pudo conectar con el servidor. Verifica que el backend este activo.',
      0,
    )
  }

  if (res.status === 204) return null

  const text = await res.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!res.ok) {
    const message =
      typeof data === 'object' && data !== null
        ? (data.error ?? data.message ?? `Error ${res.status}`)
        : `Error ${res.status}`
    throw new ApiError(message, res.status)
  }

  return data
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const login = async (email, password) => {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  return {
    idUser: data.idUser,
    email: data.email,
    role: data.role,
    token: data.token,
  }
}

export const register = async (name, email, password) => {
  const data = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, role: 'ROLE_USER' }),
  })
  return {
    idUser: data.idUser,
    email: data.email,
    name,
    role: data.role,
    token: data.token,
  }
}

// ─── Catalog ─────────────────────────────────────────────────────────────────

export const getProducts = () => apiFetch('/products')

export const getProductById = (id) => apiFetch(`/products/${id}`)

export const getCategories = () => apiFetch('/categories')

export const createProduct = (product) =>
  apiFetch('/products', { method: 'POST', body: JSON.stringify(product) })

export const updateProduct = (id, product) =>
  apiFetch(`/products/${id}`, { method: 'PUT', body: JSON.stringify(product) })

export const deleteProduct = (id) =>
  apiFetch(`/products/${id}`, { method: 'DELETE' })

// ─── Cart ────────────────────────────────────────────────────────────────────

export const getOrCreateCart = async (userId) => {
  try {
    return await apiFetch(`/cart/user/${userId}`)
  } catch (error) {
    if (error.status === 404) {
      return apiFetch(`/cart?userId=${userId}`, { method: 'POST' })
    }
    throw error
  }
}

export const getCartItems = (cartId) => apiFetch(`/cart-products/cart/${cartId}`)

export const addCartItem = (cartId, productId, quantity) =>
  apiFetch(
    `/cart-products?cartId=${cartId}&productId=${productId}&quantity=${quantity}`,
    { method: 'POST' },
  )

export const updateCartItem = (id, quantity) =>
  apiFetch(`/cart-products/${id}?quantity=${quantity}`, { method: 'PUT' })

export const removeCartItem = (id) =>
  apiFetch(`/cart-products/${id}`, { method: 'DELETE' })

// ─── Orders ──────────────────────────────────────────────────────────────────

export const getOrders = () => apiFetch('/orders')

export const getUserOrders = (userId) => apiFetch(`/orders/user/${userId}`)

export const getOrder = (id) => apiFetch(`/orders/${id}`)

export const getOrderItems = (id) => apiFetch(`/orders/${id}/items`)

export const updateOrderStatus = (id, status) =>
  apiFetch(`/orders/${id}/status?status=${encodeURIComponent(status)}`, {
    method: 'PATCH',
  })

export const createOrder = async ({ userId, cartId, discountCode }) => {
  const params = new URLSearchParams({
    userId: String(userId),
    cartId: String(cartId),
  })
  if (discountCode?.trim()) {
    params.set('discountCode', discountCode.trim())
  }
  return apiFetch(`/orders?${params}`, { method: 'POST' })
}

export const mapOrderItems = (items) =>
  items.map((item) => ({
    idProduct: item.product.idProduct,
    productName: item.product.productName,
    imageProduct: item.product.imageProduct,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
  }))

export const enrichOrder = (order, items) => {
  const mappedItems = mapOrderItems(items)
  const subtotal = mappedItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  )
  const discountAmount = order.discount
    ? subtotal * (order.discount.percentage / 100)
    : 0

  return {
    idOrder: order.idOrder,
    status: order.status,
    total: order.total,
    userId: order.user?.idUser,
    userEmail: order.user?.email,
    items: mappedItems,
    subtotal,
    discountAmount,
    shippingCost: 0,
    discountCode: order.discount?.code ?? null,
  }
}

export const fetchOrderDetail = async (idOrder) => {
  const [order, items] = await Promise.all([getOrder(idOrder), getOrderItems(idOrder)])
  return enrichOrder(order, items)
}

export const fetchOrdersWithItems = async (orders) =>
  Promise.all(
    orders.map(async (order) => {
      const items = await getOrderItems(order.idOrder)
      return enrichOrder(order, items)
    }),
  )

// ─── Discounts ───────────────────────────────────────────────────────────────

export const getDiscountByCode = (code) =>
  apiFetch(`/discounts/code/${encodeURIComponent(code.trim())}`)
