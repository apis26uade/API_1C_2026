import { CheckCircleIcon } from './Icons.jsx'
import { useCart } from '../context/CartContext.jsx'

function CartToast() {
  const { cartToast } = useCart()

  if (!cartToast) return null

  return (
    <div className="cart-toast" role="status" aria-live="polite">
      <span className="cart-toast-icon">
        <CheckCircleIcon />
      </span>
      <p>
        &quot;{cartToast}&quot; agregado al carrito
      </p>
    </div>
  )
}

export default CartToast
