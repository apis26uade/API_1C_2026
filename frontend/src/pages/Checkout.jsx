import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { createOrder } from '../services/api.js'

const formatPrice = (price) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(price)

const initialForm = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  postalCode: '',
  notes: '',
}

function Checkout() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const {
    items,
    cartId,
    subtotal,
    shipping,
    discountCode,
    discountPercent,
    discountAmount,
    total,
    clearCart,
  } = useCart()
  const [form, setForm] = useState(initialForm)
  const [completed, setCompleted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' }, replace: true })
      return
    }
    if (!items.length && !completed) {
      navigate('/carrito', { replace: true })
    }
    if (user?.email) {
      setForm((current) => ({ ...current, email: user.email }))
    }
  }, [completed, isAuthenticated, items.length, navigate, user?.email])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!cartId || !user?.idUser) {
      setError('No se encontro el carrito del usuario')
      return
    }

    setLoading(true)
    setError('')

    try {
      await createOrder(
        user.idUser,
        Number(cartId),
        discountPercent > 0 ? discountCode.trim() : undefined,
      )
      clearCart()
      setCompleted(true)
    } catch (submitError) {
      setError(submitError.message || 'No se pudo confirmar la compra')
    } finally {
      setLoading(false)
    }
  }

  if (completed) {
    return (
      <section className="checkout-page section-container center-section">
        <p className="eyebrow">Pedido confirmado</p>
        <h1>Gracias por tu compra</h1>
        <p>
          Tu orden fue creada en el backend. Te enviaremos la confirmacion a{' '}
          <strong>{form.email}</strong>.
        </p>
        <Link className="button primary" to="/catalogo">
          Seguir comprando
        </Link>
      </section>
    )
  }

  return (
    <section className="checkout-page section-container">
      <div className="checkout-header">
        <p className="eyebrow">Ultimo paso</p>
        <h1>Finalizar compra</h1>
      </div>

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <h2>Datos de envio</h2>
          <div className="checkout-grid">
            <label>
              Nombre completo
              <input name="name" value={form.name} onChange={handleChange} required />
            </label>
            <label>
              Email
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Telefono
              <input name="phone" value={form.phone} onChange={handleChange} required />
            </label>
            <label className="full-width">
              Direccion
              <input name="address" value={form.address} onChange={handleChange} required />
            </label>
            <label>
              Ciudad
              <input name="city" value={form.city} onChange={handleChange} required />
            </label>
            <label>
              Codigo postal
              <input name="postalCode" value={form.postalCode} onChange={handleChange} required />
            </label>
            <label className="full-width">
              Notas del pedido (opcional)
              <textarea name="notes" value={form.notes} onChange={handleChange} rows="4" />
            </label>
          </div>

          {error ? <p className="auth-error">{error}</p> : null}

          <button className="button checkout-btn full" type="submit" disabled={loading}>
            {loading ? 'Confirmando...' : 'Confirmar compra'}
          </button>
          <Link className="checkout-back" to="/carrito">
            Volver al carrito
          </Link>
        </form>

        <aside className="checkout-summary">
          <h2>Resumen del pedido</h2>
          <ul className="checkout-items">
            {items.map(({ product, quantity, unitPrice }) => (
              <li key={product.idProduct}>
                <span>
                  {product.productName} x{quantity}
                </span>
                <strong>{formatPrice(unitPrice * quantity)}</strong>
              </li>
            ))}
          </ul>
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
          <div className="cart-summary-row checkout-total">
            <span>Total estimado</span>
            <strong>{formatPrice(total)}</strong>
          </div>
          <p className="cart-note">
            La orden en el backend aplica el descuento sobre el subtotal del carrito.
          </p>
        </aside>
      </div>
    </section>
  )
}

export default Checkout
