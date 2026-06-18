import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  addCartItem,
  getCartItems,
  getOrCreateUserCart,
  mapCartProduct,
  removeCartItem,
  updateCartItem,
} from '../services/api.js'
import { useAuth } from './AuthContext.jsx'

const CartContext = createContext(null)
const STORAGE_KEY = 'boho_cart'
const CART_ID_KEY = 'boho_cart_id'
const SHIPPING_COST = 12
const FREE_SHIPPING_MIN = 150

const readLocalItems = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const { isAuthenticated, user } = useAuth()
  const [items, setItems] = useState(readLocalItems)
  const [cartId, setCartId] = useState(() => localStorage.getItem(CART_ID_KEY))
  const [discountCode, setDiscountCode] = useState('')
  const [discountPercent, setDiscountPercent] = useState(0)
  const [discountMessage, setDiscountMessage] = useState('')

  const persistLocal = useCallback((nextItems) => {
    setItems(nextItems)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems))
  }, [])

  const loadBackendCart = useCallback(async (userId) => {
    const cart = await getOrCreateUserCart(userId)
    setCartId(String(cart.idCart))
    localStorage.setItem(CART_ID_KEY, String(cart.idCart))

    const backendItems = await getCartItems(cart.idCart)
    const mapped = backendItems.map(mapCartProduct)
    persistLocal(mapped)
    return mapped
  }, [persistLocal])

  const syncLocalToBackend = useCallback(
    async (userId) => {
      const cart = await getOrCreateUserCart(userId)
      const currentCartId = cart.idCart
      setCartId(String(currentCartId))
      localStorage.setItem(CART_ID_KEY, String(currentCartId))

      const localItems = readLocalItems()
      for (const entry of localItems) {
        await addCartItem(currentCartId, entry.product.idProduct, entry.quantity)
      }

      return loadBackendCart(userId)
    },
    [loadBackendCart],
  )

  useEffect(() => {
    if (isAuthenticated && user?.idUser) {
      syncLocalToBackend(user.idUser).catch(() => loadBackendCart(user.idUser))
    }
  }, [isAuthenticated, user?.idUser, syncLocalToBackend, loadBackendCart])

  const addItem = async (product, quantity = 1) => {
    if (!product || product.stock === 0) return

    const existing = items.find((entry) => entry.product.idProduct === product.idProduct)
    const nextQuantity = Math.min(
      (existing?.quantity ?? 0) + quantity,
      product.stock,
    )

    if (isAuthenticated && user?.idUser) {
      try {
        let activeCartId = cartId
        if (!activeCartId) {
          const cart = await getOrCreateUserCart(user.idUser)
          activeCartId = String(cart.idCart)
          setCartId(activeCartId)
          localStorage.setItem(CART_ID_KEY, activeCartId)
        }

        if (existing?.idCartProduct) {
          await updateCartItem(existing.idCartProduct, nextQuantity)
        } else {
          await addCartItem(activeCartId, product.idProduct, quantity)
        }

        await loadBackendCart(user.idUser)
        return
      } catch {
        // fallback to local cart
      }
    }

    if (existing) {
      persistLocal(
        items.map((entry) =>
          entry.product.idProduct === product.idProduct
            ? { ...entry, quantity: nextQuantity, unitPrice: product.price }
            : entry,
        ),
      )
      return
    }

    persistLocal([
      ...items,
      {
        idCartProduct: null,
        product,
        quantity: Math.min(quantity, product.stock),
        unitPrice: product.price,
      },
    ])
  }

  const updateQuantity = async (idProduct, quantity) => {
    const entry = items.find((item) => item.product.idProduct === idProduct)
    if (!entry) return

    const safeQuantity = Math.max(1, Math.min(quantity, entry.product.stock))

    if (isAuthenticated && entry.idCartProduct) {
      await updateCartItem(entry.idCartProduct, safeQuantity)
      await loadBackendCart(user.idUser)
      return
    }

    persistLocal(
      items.map((item) =>
        item.product.idProduct === idProduct ? { ...item, quantity: safeQuantity } : item,
      ),
    )
  }

  const removeItem = async (idProduct) => {
    const entry = items.find((item) => item.product.idProduct === idProduct)

    if (isAuthenticated && entry?.idCartProduct) {
      await removeCartItem(entry.idCartProduct)
      await loadBackendCart(user.idUser)
      return
    }

    persistLocal(items.filter((item) => item.product.idProduct !== idProduct))
  }

  const clearCart = () => {
    persistLocal([])
    setDiscountCode('')
    setDiscountPercent(0)
    setDiscountMessage('')
  }

  const subtotal = useMemo(
    () => items.reduce((sum, entry) => sum + entry.unitPrice * entry.quantity, 0),
    [items],
  )

  const discountAmount = useMemo(
    () => (subtotal * discountPercent) / 100,
    [discountPercent, subtotal],
  )

  const shipping = useMemo(
    () => (subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_COST),
    [subtotal],
  )

  const total = useMemo(
    () => subtotal - discountAmount + shipping,
    [discountAmount, shipping, subtotal],
  )

  const itemCount = useMemo(
    () => items.reduce((count, entry) => count + entry.quantity, 0),
    [items],
  )

  return (
    <CartContext.Provider
      value={{
        items,
        cartId,
        itemCount,
        subtotal,
        shipping,
        discountCode,
        discountPercent,
        discountAmount,
        discountMessage,
        total,
        setDiscountCode,
        setDiscountPercent,
        setDiscountMessage,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        syncLocalToBackend,
        loadBackendCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider')
  }
  return context
}
