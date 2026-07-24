import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { CheckCircleIcon, XIcon } from './Icons.jsx'
import { dismissAddedItemModal } from '../features/cart/cartSlice.js'
import {
  selectAddedItemModal,
  selectCartTotal,
  selectDiscountAmount,
  selectDiscountPercent,
  selectItemCount,
  selectShipping,
  selectSubtotal,
} from '../features/cart/cartSelectors.js'

const formatPrice = (price) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(price)

function CartAddedModal() {
  const dispatch = useDispatch()
  const modal = useSelector(selectAddedItemModal)
  const itemCount = useSelector(selectItemCount)
  const subtotal = useSelector(selectSubtotal)
  const shipping = useSelector(selectShipping)
  const discountPercent = useSelector(selectDiscountPercent)
  const discountAmount = useSelector(selectDiscountAmount)
  const total = useSelector(selectCartTotal)

  const close = () => dispatch(dismissAddedItemModal())

  useEffect(() => {
    if (!modal) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') dispatch(dismissAddedItemModal())
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [dispatch, modal])

  if (!modal) return null

  const { product, quantity } = modal
  const categoryName = product.category?.categoryName ?? product.category ?? 'Coleccion'
  const articleLabel = itemCount === 1 ? 'articulo' : 'articulos'

  return (
    <div className="cart-added-overlay" role="presentation" onClick={close}>
      <div
        className="cart-added-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-added-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="cart-added-header">
          <div className="cart-added-title-wrap">
            <span className="cart-added-icon" aria-hidden="true">
              <CheckCircleIcon size={22} />
            </span>
            <h2 id="cart-added-title">Producto añadido al carrito</h2>
          </div>
          <button type="button" className="cart-added-close" onClick={close} aria-label="Cerrar">
            <XIcon size={18} />
          </button>
        </header>

        <div className="cart-added-body">
          <div className="cart-added-product">
            <div className="cart-added-product-media">
              {product.imageProduct ? (
                <img src={product.imageProduct} alt={product.productName} />
              ) : (
                <span>{categoryName}</span>
              )}
            </div>
            <div className="cart-added-product-info">
              <p className="eyebrow">{categoryName}</p>
              <h3>{product.productName}</h3>
              <strong>{formatPrice(product.price)}</strong>
              <dl className="cart-added-meta">
                <div>
                  <dt>Cantidad</dt>
                  <dd>{quantity}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="cart-added-divider" aria-hidden="true" />

          <aside className="cart-added-summary">
            <h3>Tu carrito</h3>
            <p className="cart-added-count">
              {itemCount} {articleLabel}
            </p>
            <dl className="cart-added-rows">
              <div>
                <dt>Subtotal</dt>
                <dd>{formatPrice(subtotal)}</dd>
              </div>
              {discountPercent > 0 ? (
                <div>
                  <dt>Descuento ({discountPercent}%)</dt>
                  <dd>-{formatPrice(discountAmount)}</dd>
                </div>
              ) : null}
              <div>
                <dt>Envio</dt>
                <dd>{shipping === 0 ? 'Gratis' : formatPrice(shipping)}</dd>
              </div>
              <div className="cart-added-total-row">
                <dt>Total</dt>
                <dd>{formatPrice(total)}</dd>
              </div>
            </dl>

            <div className="cart-added-actions">
              <Link className="button primary full" to="/carrito" onClick={close}>
                Ver carrito
              </Link>
              <button className="button secondary full" type="button" onClick={close}>
                Seguir comprando
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default CartAddedModal
