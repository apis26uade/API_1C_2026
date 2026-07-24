import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useToast } from '../context/ToastContext.jsx'
import { selectIsAuthenticated, selectUser } from '../features/auth/authSelectors.js'
import { resetToLocalCart } from '../features/cart/cartSlice.js'
import { syncCartWithBackend } from '../features/cart/cartThunks.js'

function CartSync() {
  const dispatch = useDispatch()
  const { toastError } = useToast()
  const user = useSelector(selectUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const wasAuthenticatedRef = useRef(isAuthenticated)

  useEffect(() => {
    if (wasAuthenticatedRef.current && !isAuthenticated) {
      dispatch(resetToLocalCart())
    }
    wasAuthenticatedRef.current = isAuthenticated
  }, [dispatch, isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated || !user?.idUser) {
      dispatch(resetToLocalCart())
      return undefined
    }

    let cancelled = false

    const syncCart = async () => {
      try {
        await dispatch(syncCartWithBackend(user.idUser)).unwrap()
      } catch (error) {
        if (!cancelled) {
          toastError(error || 'No se pudo sincronizar el carrito')
        }
      }
    }

    syncCart()
    return () => {
      cancelled = true
    }
  }, [dispatch, isAuthenticated, toastError, user?.idUser])

  return null
}

export default CartSync
