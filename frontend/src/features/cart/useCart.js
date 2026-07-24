import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useToast } from '../../context/ToastContext.jsx'
import { selectIsAuthenticated } from '../auth/authSelectors.js'
import {
  addLocalItem,
  applyDiscount as applyDiscountAction,
  clearCart as clearCartAction,
  clearDiscount as clearDiscountAction,
  updateLocalItemQuantity,
  removeLocalItem,
} from './cartSlice.js'
import {
  addCartItem,
  fetchCartItems,
  removeCartItem as removeCartItemApi,
  updateCartItem,
} from './cartThunks.js'
import {
  selectAppliedDiscount,
  selectCartId,
  selectCartItems,
  selectCartSyncing,
  selectCartTotal,
  selectDiscountAmount,
  selectDiscountCode,
  selectDiscountPercent,
  selectItemCount,
  selectShipping,
  selectSubtotal,
} from './cartSelectors.js'

export function useCart() {
  const dispatch = useDispatch()
  const { toastSuccess, toastError } = useToast()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const items = useSelector(selectCartItems)
  const cartId = useSelector(selectCartId)
  const syncing = useSelector(selectCartSyncing)
  const appliedDiscount = useSelector(selectAppliedDiscount)
  const itemCount = useSelector(selectItemCount)
  const subtotal = useSelector(selectSubtotal)
  const shipping = useSelector(selectShipping)
  const discountCode = useSelector(selectDiscountCode)
  const discountPercent = useSelector(selectDiscountPercent)
  const discountAmount = useSelector(selectDiscountAmount)
  const total = useSelector(selectCartTotal)

  const notifyAdded = useCallback(
    (productName) => {
      toastSuccess(`"${productName}" agregado al carrito`)
    },
    [toastSuccess],
  )

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated || !cartId) return

    try {
      await dispatch(fetchCartItems(cartId)).unwrap()
    } catch (error) {
      toastError(error || 'No se pudo actualizar el carrito')
    }
  }, [cartId, dispatch, isAuthenticated, toastError])

  const addItem = useCallback(
    async (product, quantity = 1) => {
      if (!product || product.stock === 0) return

      if (isAuthenticated && cartId) {
        try {
          const existing = items.find((entry) => entry.product.idProduct === product.idProduct)
          const nextQuantity = Math.min((existing?.quantity ?? 0) + quantity, product.stock)

          if (existing) {
            await dispatch(
              updateCartItem({ id: existing.idCartProduct, quantity: nextQuantity }),
            ).unwrap()
          } else {
            await dispatch(
              addCartItem({
                cartId,
                productId: product.idProduct,
                quantity: Math.min(quantity, product.stock),
              }),
            ).unwrap()
          }

          notifyAdded(product.productName)
        } catch (error) {
          toastError(error || 'No se pudo agregar al carrito')
          await refreshCart()
        }
        return
      }

      dispatch(addLocalItem({ product, quantity }))
      notifyAdded(product.productName)
    },
    [cartId, dispatch, isAuthenticated, items, notifyAdded, refreshCart, toastError],
  )

  const updateQuantity = useCallback(
    async (idProduct, quantity) => {
      const entry = items.find((item) => item.product.idProduct === idProduct)
      if (!entry) return

      const safeQuantity = Math.max(1, Math.min(quantity, entry.product.stock))

      if (isAuthenticated && cartId && entry.idCartProduct) {
        try {
          await dispatch(
            updateCartItem({ id: entry.idCartProduct, quantity: safeQuantity }),
          ).unwrap()
        } catch (error) {
          toastError(error || 'No se pudo actualizar la cantidad')
          await refreshCart()
        }
        return
      }

      dispatch(updateLocalItemQuantity({ idProduct, quantity: safeQuantity }))
    },
    [cartId, dispatch, isAuthenticated, items, refreshCart, toastError],
  )

  const removeItem = useCallback(
    async (idProduct) => {
      const entry = items.find((item) => item.product.idProduct === idProduct)
      if (!entry) return

      if (isAuthenticated && cartId && entry.idCartProduct) {
        try {
          await dispatch(removeCartItemApi(entry.idCartProduct)).unwrap()
        } catch (error) {
          toastError(error || 'No se pudo eliminar el producto')
        }
        return
      }

      dispatch(removeLocalItem(idProduct))
    },
    [cartId, dispatch, isAuthenticated, items, toastError],
  )

  const applyDiscount = useCallback(
    (discount) => {
      dispatch(
        applyDiscountAction({
          code: discount.code,
          percentage: discount.percentage,
        }),
      )
    },
    [dispatch],
  )

  const clearDiscount = useCallback(() => {
    dispatch(clearDiscountAction())
  }, [dispatch])

  const clearCart = useCallback(() => {
    dispatch(clearCartAction())
  }, [dispatch])

  return {
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
  }
}
