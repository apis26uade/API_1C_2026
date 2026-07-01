import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

const getToken = () => localStorage.getItem('boho_token')

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export const api = axios.create({
  baseURL: BASE_URL,
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject(
        new ApiError('No se pudo conectar con el servidor. Verifica que el backend este activo.', 0)
      )
    }

    const { status, data } = error.response
    let message = `Error ${status}`

    if (typeof data === 'object' && data !== null) {
      message = data.error ??
        (data.errors ? Object.values(data.errors)[0] : null) ??
        data.message ??
        `Error ${status}`
    } else if (typeof data === 'string') {
      message = data || `Error ${status}`
    }

    return Promise.reject(new ApiError(message, status))
  }
)

export async function apiFetch(path, options = {}) {
  const method = options.method || 'GET'
  const data = options.body ? JSON.parse(options.body) : undefined

  try {
    const response = await api({
      url: path,
      method,
      data,
      headers: options.headers,
    })
    
    // axios handles 204 No Content by returning empty data
    if (response.status === 204) return null

    return response.data
  } catch (error) {
    throw error // ApiError already thrown by interceptor
  }
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

export const createCategory = (categoryName) =>
  apiFetch('/categories', {
    method: 'POST',
    body: JSON.stringify({ categoryName: categoryName.trim() }),
  })

export const updateCategory = (id, categoryName) =>
  apiFetch(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ categoryName: categoryName.trim() }),
  })

export const deleteCategory = (id) =>
  apiFetch(`/categories/${id}`, { method: 'DELETE' })

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

export const validateCartStock = async (cartId) => {
  const items = await getCartItems(cartId)
  const problems = []

  for (const item of items) {
    const name = item.product?.productName ?? 'Producto'
    const stock = item.product?.stock ?? 0

    if (stock <= 0) {
      problems.push(`"${name}" ya no tiene stock`)
      continue
    }

    if (item.quantity > stock) {
      problems.push(`"${name}": pedis ${item.quantity}, hay ${stock} disponible${stock !== 1 ? 's' : ''}`)
    }
  }

  if (problems.length) {
    throw new ApiError(`Stock insuficiente: ${problems.join('. ')}`, 400)
  }

  return items
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export const getOrders = () => apiFetch('/orders')

export const getOrdersWithItems = () => apiFetch('/orders?includeItems=true')

export const getUserOrders = (userId) => apiFetch(`/orders/user/${userId}`)

export const getUserOrdersWithItems = (userId) =>
  apiFetch(`/orders/user/${userId}?includeItems=true`)

export const getOrder = (id) => apiFetch(`/orders/${id}`)

export const getOrderItems = (id) => apiFetch(`/orders/${id}/items`)

export const updateOrderStatus = (id, status) =>
  apiFetch(`/orders/${id}/status?status=${encodeURIComponent(status)}`, {
    method: 'PATCH',
  })

export const createOrder = async ({ userId, cartId, discountCode, shipping }) =>
  apiFetch('/orders', {
    method: 'POST',
    body: JSON.stringify({
      userId,
      cartId,
      discountCode: discountCode?.trim() || undefined,
      shipping,
    }),
  })

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
    shipping: {
      name: order.shippingName ?? '',
      email: order.shippingEmail ?? order.user?.email ?? '',
      phone: order.shippingPhone ?? '',
      address: order.shippingAddress ?? '',
      city: order.shippingCity ?? '',
      postalCode: order.shippingPostalCode ?? '',
      notes: order.shippingNotes ?? '',
    },
  }
}

export const fetchOrderDetail = async (idOrder) => {
  const [order, items] = await Promise.all([getOrder(idOrder), getOrderItems(idOrder)])
  return enrichOrder(order, items)
}

export const mapOrdersWithItems = (entries) =>
  entries.map(({ order, items }) => enrichOrder(order, items))

// ─── Discounts ───────────────────────────────────────────────────────────────

export const getDiscountByCode = (code) =>
  apiFetch(`/discounts/code/${encodeURIComponent(code.trim())}`)
