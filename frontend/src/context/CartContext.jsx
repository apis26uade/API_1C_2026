import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  addCartItem,
  getCartItems,
  getOrCreateCart,
  removeCartItem,
  updateCartItem,
} from '../services/api.js'
import { useAuth } from './AuthContext.jsx'

const CartContext = createContext(null)
const STORAGE_KEY = 'boho_cart'
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

const mapCartProduct = (entry) => ({
  idCartProduct: entry.idCartProduct,
  product: entry.product,
  quantity: entry.quantity,
  unitPrice: entry.unitPrice,
})

const TOAST_DURATION_MS = 3200

export function CartProvider({ children }) {
  const { user, isAuthenticated } = useAuth()
  const [items, setItems] = useState(readLocalItems)
  const [cartId, setCartId] = useState(null)
  const [syncing, setSyncing] = useState(false)
  const [cartError, setCartError] = useState('')
  const [cartToast, setCartToast] = useState(null)
  const [discountCode, setDiscountCode] = useState('')
  const [discountPercent, setDiscountPercent] = useState(0)
  const [discountMessage, setDiscountMessage] = useState('')
  const toastTimerRef = useRef(null)
  const wasAuthenticatedRef = useRef(isAuthenticated)

  const showCartToast = useCallback((productName) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current)
    }
    setCartToast(productName)
    toastTimerRef.current = setTimeout(() => {
      setCartToast(null)
      toastTimerRef.current = null
    }, TOAST_DURATION_MS)
  }, [])

  useEffect(
    () => () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    },
    [],
  )

  useEffect(() => {
    if (wasAuthenticatedRef.current && !isAuthenticated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
      setCartId(null)
    }
    wasAuthenticatedRef.current = isAuthenticated
  }, [isAuthenticated, items])

  useEffect(() => {
    if (!isAuthenticated || !user?.idUser) {
      setCartId(null)
      setItems(readLocalItems())
      return undefined
    }

    let cancelled = false

    const syncCart = async () => {
      setSyncing(true)
      setCartError('')
      try {
        const cart = await getOrCreateCart(user.idUser)
        if (cancelled) return

        setCartId(cart.idCart)

        const localItems = readLocalItems()
        const backendItems = await getCartItems(cart.idCart)
        if (cancelled) return

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
            const updated = await updateCartItem(existing.idCartProduct, targetQty)
            backendByProduct.set(productId, updated)
          } else {
            const created = await addCartItem(cart.idCart, productId, targetQty)
            backendByProduct.set(productId, created)
          }
        }

        if (localItems.length) {
          localStorage.removeItem(STORAGE_KEY)
        }

        const syncedItems = await getCartItems(cart.idCart)
        if (cancelled) return
        setItems(syncedItems.map(mapCartProduct))
      } catch (error) {
        if (!cancelled) {
          setCartError(error.message || 'No se pudo sincronizar el carrito')
          setItems(readLocalItems())
        }
      } finally {
        if (!cancelled) setSyncing(false)
      }
    }

    syncCart()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, user?.idUser])

  const persistLocal = useCallback((nextItems) => {
    setItems(nextItems)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems))
  }, [])

  const addItem = async (product, quantity = 1) => {
    if (!product || product.stock === 0) return

    if (isAuthenticated && cartId) {
      setCartError('')
      try {
        const existing = items.find((entry) => entry.product.idProduct === product.idProduct)
        const nextQuantity = Math.min(
          (existing?.quantity ?? 0) + quantity,
          product.stock,
        )

        if (existing) {
          const updated = await updateCartItem(existing.idCartProduct, nextQuantity)
          setItems((current) =>
            current.map((entry) =>
              entry.idCartProduct === existing.idCartProduct
                ? mapCartProduct(updated)
                : entry,
            ),
          )
        } else {
          const created = await addCartItem(
            cartId,
            product.idProduct,
            Math.min(quantity, product.stock),
          )
          setItems((current) => [...current, mapCartProduct(created)])
        }

        showCartToast(product.productName)
      } catch (error) {
        setCartError(error.message || 'No se pudo agregar al carrito')
      }
      return
    }

    const existing = items.find((entry) => entry.product.idProduct === product.idProduct)
    const nextQuantity = Math.min((existing?.quantity ?? 0) + quantity, product.stock)

    if (existing) {
      persistLocal(
        items.map((entry) =>
          entry.product.idProduct === product.idProduct
            ? { ...entry, quantity: nextQuantity, unitPrice: product.price }
            : entry,
        ),
      )
      showCartToast(product.productName)
      return
    }

    persistLocal([
      ...items,
      {
        idCartProduct: `${product.idProduct}-${Date.now()}`,
        product,
        quantity: Math.min(quantity, product.stock),
        unitPrice: product.price,
      },
    ])
    showCartToast(product.productName)
  }

  const updateQuantity = async (idProduct, quantity) => {
    const entry = items.find((item) => item.product.idProduct === idProduct)
    if (!entry) return

    const safeQuantity = Math.max(1, Math.min(quantity, entry.product.stock))

    if (isAuthenticated && cartId && entry.idCartProduct) {
      setCartError('')
      try {
        const updated = await updateCartItem(entry.idCartProduct, safeQuantity)
        setItems((current) =>
          current.map((item) =>
            item.idCartProduct === entry.idCartProduct ? mapCartProduct(updated) : item,
          ),
        )
      } catch (error) {
        setCartError(error.message || 'No se pudo actualizar la cantidad')
      }
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
    if (!entry) return

    if (isAuthenticated && cartId && entry.idCartProduct) {
      setCartError('')
      try {
        await removeCartItem(entry.idCartProduct)
        setItems((current) =>
          current.filter((item) => item.product.idProduct !== idProduct),
        )
      } catch (error) {
        setCartError(error.message || 'No se pudo eliminar el producto')
      }
      return
    }

    persistLocal(items.filter((item) => item.product.idProduct !== idProduct))
  }

  const clearCart = () => {
    setItems([])
    if (!isAuthenticated) {
      localStorage.removeItem(STORAGE_KEY)
    }
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
        syncing,
        cartError,
        cartToast,
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
