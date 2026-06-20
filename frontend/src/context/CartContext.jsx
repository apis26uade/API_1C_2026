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
import { useToast } from './ToastContext.jsx'

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

export function CartProvider({ children }) {
  const { user, isAuthenticated } = useAuth()
  const { toastSuccess, toastError } = useToast()
  const [items, setItems] = useState(readLocalItems)
  const [cartId, setCartId] = useState(null)
  const [syncing, setSyncing] = useState(false)
  const [appliedDiscount, setAppliedDiscount] = useState(null)
  const wasAuthenticatedRef = useRef(isAuthenticated)

  const discountCode = appliedDiscount?.code ?? ''
  const discountPercent = appliedDiscount?.percentage ?? 0

  const notifyAdded = useCallback(
    (productName) => {
      toastSuccess(`"${productName}" agregado al carrito`)
    },
    [toastSuccess],
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
          toastError(error.message || 'No se pudo sincronizar el carrito')
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
  }, [isAuthenticated, toastError, user?.idUser])

  const persistLocal = useCallback((nextItems) => {
    setItems(nextItems)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems))
  }, [])

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated || !cartId) return

    try {
      const syncedItems = await getCartItems(cartId)
      setItems(syncedItems.map(mapCartProduct))
    } catch (error) {
      toastError(error.message || 'No se pudo actualizar el carrito')
    }
  }, [cartId, isAuthenticated, toastError])

  const addItem = async (product, quantity = 1) => {
    if (!product || product.stock === 0) return

    if (isAuthenticated && cartId) {
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

        notifyAdded(product.productName)
      } catch (error) {
        toastError(error.message || 'No se pudo agregar al carrito')
        await refreshCart()
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
      notifyAdded(product.productName)
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
    notifyAdded(product.productName)
  }

  const updateQuantity = async (idProduct, quantity) => {
    const entry = items.find((item) => item.product.idProduct === idProduct)
    if (!entry) return

    const safeQuantity = Math.max(1, Math.min(quantity, entry.product.stock))

    if (isAuthenticated && cartId && entry.idCartProduct) {
      try {
        const updated = await updateCartItem(entry.idCartProduct, safeQuantity)
        setItems((current) =>
          current.map((item) =>
            item.idCartProduct === entry.idCartProduct ? mapCartProduct(updated) : item,
          ),
        )
      } catch (error) {
        toastError(error.message || 'No se pudo actualizar la cantidad')
        await refreshCart()
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
      try {
        await removeCartItem(entry.idCartProduct)
        setItems((current) =>
          current.filter((item) => item.product.idProduct !== idProduct),
        )
      } catch (error) {
        toastError(error.message || 'No se pudo eliminar el producto')
      }
      return
    }

    persistLocal(items.filter((item) => item.product.idProduct !== idProduct))
  }

  const clearDiscount = useCallback(() => {
    setAppliedDiscount(null)
  }, [])

  const applyDiscount = useCallback((discount) => {
    setAppliedDiscount({
      code: discount.code,
      percentage: discount.percentage,
    })
  }, [])

  const clearCart = () => {
    setItems([])
    if (!isAuthenticated) {
      localStorage.removeItem(STORAGE_KEY)
    }
    setAppliedDiscount(null)
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
        itemCount,
        subtotal,
        shipping,
        discountCode,
        discountPercent,
        discountAmount,
        total,
        appliedDiscount,
        applyDiscount,
        clearDiscount,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
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
