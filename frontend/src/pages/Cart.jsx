import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRightIcon, TagIcon, TrashIcon } from '../components/Icons.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { getDiscountByCode } from '../services/api.js'

const formatPrice = (price) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(price)

function Cart() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const {
    items,
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
    cartError,
    syncing,
    updateQuantity,
    removeItem,
  } = useCart()
  const [applyingDiscount, setApplyingDiscount] = useState(false)

  const handleApplyDiscount = async (event) => {
    event.preventDefault()
    const code = discountCode.trim()
    if (!code) return

    if (!isAuthenticated) {
      setDiscountPercent(0)
      setDiscountMessage('Inicia sesion para aplicar un codigo de descuento')
      return
    }

    setApplyingDiscount(true)
    try {
      const discount = await getDiscountByCode(code)
      setDiscountPercent(discount.percentage)
      setDiscountMessage(`Codigo ${discount.code} aplicado (${discount.percentage}%)`)
    } catch (discountError) {
      setDiscountPercent(0)
      setDiscountMessage(discountError.message || 'Codigo invalido')
    } finally {
      setApplyingDiscount(false)
    }
  }

  const handleFinalize = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } })
      return
    }
    navigate('/checkout')
  }

  if (!items.length) {
    return (
      <section className="cart-page section-container center-section">
        <p className="eyebrow">Tu bolsa</p>
        <h1>Tu carrito esta vacio</h1>
        <p>Explora el catalogo y agrega prendas que te inspiren.</p>
        <Link className="button primary" to="/catalogo">
          Ver catalogo
        </Link>
      </section>
    )
  }

  const articleLabel = itemCount === 1 ? 'articulo' : 'articulos'

  return (
    <section className="cart-page section-container">
      <h1 className="cart-title">
        Tu carrito ({itemCount} {articleLabel})
      </h1>

      {syncing ? <p className="async-hint">Sincronizando carrito con el servidor...</p> : null}
      {cartError ? <p className="auth-error">{cartError}</p> : null}

      <div className="cart-layout">
        <div className="cart-items">
          {items.map(({ product, quantity, unitPrice, idCartProduct }) => (
            <article className="cart-item-card" key={idCartProduct ?? product.idProduct}>
              <Link className="cart-item-image" to={`/producto/${product.idProduct}`}>
                <img src={product.imageProduct} alt={product.productName} />
              </Link>

              <div className="cart-item-body">
                <p className="cart-item-category">{product.category?.categoryName}</p>
                <h2>{product.productName}</h2>
                <p className="cart-item-unit">{formatPrice(unitPrice)} c/u</p>

                <div className="cart-item-footer">
                  <div className="quantity-control compact">
                    <button
                      type="button"
                      onClick={() => updateQuantity(product.idProduct, quantity - 1)}
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span>{quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(product.idProduct, quantity + 1)}
                      disabled={quantity >= product.stock}
                    >
                      +
                    </button>
                  </div>

                  <div className="cart-item-price-wrap">
                    <strong>{formatPrice(unitPrice * quantity)}</strong>
                    <button
                      className="cart-trash"
                      type="button"
                      onClick={() => removeItem(product.idProduct)}
                      aria-label="Eliminar producto"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <aside className="cart-summary-panel">
          <h2>Resumen del pedido</h2>

          <form className="discount-form cart-discount" onSubmit={handleApplyDiscount}>
            <label>
              <TagIcon />
              Codigo de descuento
            </label>
            <div className="discount-row">
              <input
                value={discountCode}
                onChange={(event) => setDiscountCode(event.target.value)}
                placeholder="VERANO10"
              />
              <button className="button apply-discount" type="submit" disabled={applyingDiscount}>
                Aplicar
              </button>
            </div>
          </form>
          {discountMessage ? <p className="discount-message">{discountMessage}</p> : null}

          <div className="cart-summary-row">
            <span>Subtotal</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>
          <div className="cart-summary-row shipping-row">
            <span>Envio</span>
            <strong>{formatPrice(shipping)}</strong>
          </div>
          {discountPercent > 0 ? (
            <div className="cart-summary-row discount-row">
              <span>Descuento ({discountPercent}%)</span>
              <strong>-{formatPrice(discountAmount)}</strong>
            </div>
          ) : null}
          <div className="cart-summary-row cart-total-row">
            <span>Total</span>
            <strong>{formatPrice(total)}</strong>
          </div>

          <button className="button checkout-btn full" type="button" onClick={handleFinalize}>
            Finalizar compra
            <ArrowRightIcon />
          </button>
          <p className="cart-security-note">
            Pago 100% seguro · Devoluciones en 30 dias
          </p>
          {!isAuthenticated ? (
            <p className="cart-login-note">
              Debes <Link to="/login" state={{ from: '/checkout' }}>iniciar sesion</Link> para
              finalizar la compra.
            </p>
          ) : null}
        </aside>
      </div>
    </section>
  )
}

export default Cart
