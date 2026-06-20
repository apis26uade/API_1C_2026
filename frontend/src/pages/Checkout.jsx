import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CheckoutSummary from '../components/CheckoutSummary.jsx'
import {
  CheckIcon,
  CreditCardIcon,
  MapPinIcon,
  PackageIcon,
} from '../components/Icons.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { PAYMENT_METHODS } from '../data/paymentMethods.js'
import { createOrder, validateCartStock } from '../services/api.js'
import { formatOrderId } from '../services/orders.js'
import {
  formatCardNumberInput,
  formatCvvInput,
  formatExpiryInput,
  formatPhoneInput,
  formatPostalCodeInput,
  validatePaymentForm,
  validateShippingForm,
} from '../utils/checkoutValidation.js'

const normalizePhoneForApi = (phone) => {
  const trimmed = phone.trim()
  const hasPlus = trimmed.startsWith('+')
  const digits = trimmed.replace(/\D/g, '')
  return hasPlus ? `+${digits}` : digits
}

const buildShippingPayload = (form) => ({
  name: form.name.trim(),
  email: form.email.trim(),
  phone: normalizePhoneForApi(form.phone),
  address: form.address.trim(),
  city: form.city.trim(),
  postalCode: form.postalCode.trim().toUpperCase(),
  notes: form.notes.trim() || undefined,
})

const formatPrice = (price) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(price)

const initialShipping = {
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
    syncing,
    subtotal,
    shipping: shippingCost,
    discountCode,
    discountPercent,
    discountAmount,
    total,
    clearCart,
    refreshCart,
  } = useCart()
  const { toastSuccess, toastError } = useToast()

  const [step, setStep] = useState('shipping')
  const [shippingForm, setShippingForm] = useState(initialShipping)
  const [paymentMethod, setPaymentMethod] = useState('credit')
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    cardName: '',
  })
  const [orderId, setOrderId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [shippingErrors, setShippingErrors] = useState({})
  const [paymentErrors, setPaymentErrors] = useState({})

  const selectedPayment = PAYMENT_METHODS.find((method) => method.id === paymentMethod)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' }, replace: true })
      return
    }
    if (!items.length && step !== 'success') {
      navigate('/carrito', { replace: true })
    }
    if (user?.email) {
      setShippingForm((current) => ({
        ...current,
        email: user.email,
        name: current.name || user.name || '',
      }))
      setCardForm((current) => ({
        ...current,
        cardName: current.cardName || user.name || '',
      }))
    }
  }, [isAuthenticated, items.length, navigate, step, user?.email, user?.name])

  const clearShippingError = (field) => {
    setShippingErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  const clearPaymentError = (field) => {
    setPaymentErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  const updateShipping = (event) => {
    const { name, value } = event.target
    let nextValue = value

    if (name === 'phone') nextValue = formatPhoneInput(value)
    if (name === 'postalCode') nextValue = formatPostalCodeInput(value)

    setShippingForm((current) => ({ ...current, [name]: nextValue }))
    clearShippingError(name)
  }

  const updateCard = (event) => {
    const { name, value } = event.target
    let nextValue = value

    if (name === 'cardNumber') nextValue = formatCardNumberInput(value)
    if (name === 'expiry') nextValue = formatExpiryInput(value)
    if (name === 'cvv') nextValue = formatCvvInput(value)

    setCardForm((current) => ({ ...current, [name]: nextValue }))
    clearPaymentError(name)
  }

  const handleShippingSubmit = (event) => {
    event.preventDefault()
    const result = validateShippingForm(shippingForm)
    setShippingErrors(result.errors)
    if (result.valid) setStep('payment')
  }

  const handleConfirmOrder = async () => {
    if (!user?.idUser) {
      toastError('Debes iniciar sesion para confirmar la compra')
      return
    }

    if (!cartId) {
      toastError(
        syncing ? 'Sincronizando carrito, intenta de nuevo en un momento' : 'No se encontro el carrito',
      )
      return
    }

    const shippingResult = validateShippingForm(shippingForm)
    if (!shippingResult.valid) {
      setShippingErrors(shippingResult.errors)
      setPaymentErrors({})
      setStep('shipping')
      return
    }

    if (selectedPayment?.requiresCard) {
      const paymentResult = validatePaymentForm(cardForm)
      if (!paymentResult.valid) {
        setPaymentErrors(paymentResult.errors)
        return
      }
    }

    setLoading(true)
    setPaymentErrors({})

    try {
      await validateCartStock(cartId)
      const order = await createOrder({
        userId: user.idUser,
        cartId,
        discountCode: discountPercent > 0 ? discountCode.trim() : undefined,
        shipping: buildShippingPayload(shippingForm),
      })
      setOrderId(order.idOrder)
      clearCart()
      toastSuccess('Compra confirmada correctamente')
      setStep('success')
    } catch (submitError) {
      toastError(submitError.message || 'No se pudo confirmar la compra')
      await refreshCart()
    } finally {
      setLoading(false)
    }
  }

  if (step === 'success') {
    return (
      <section className="checkout-page section-container center-section checkout-success">
        <div className="checkout-success-icon" aria-hidden="true">
          <CheckIcon size={36} />
        </div>
        <p className="eyebrow">Pedido confirmado</p>
        <h1>Gracias por tu compra</h1>
        <p className="checkout-success-id">
          Tu pedido <strong>#{formatOrderId(orderId)}</strong> fue registrado correctamente.
        </p>
        <p>
          Enviamos la confirmacion a <strong>{shippingForm.email}</strong>. Podes seguir el
          estado desde Mis pedidos.
        </p>
        <div className="checkout-success-actions">
          <Link className="button primary" to={`/pedidos/${orderId}`}>
            <PackageIcon size={16} />
            Ver detalle del pedido
          </Link>
          <Link className="button ghost" to="/pedidos">
            Mis pedidos
          </Link>
          <Link className="checkout-back centered" to="/catalogo">
            Seguir comprando
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="checkout-page section-container">
      <div className="checkout-header">
        <p className="eyebrow">Checkout</p>
        <h1>Finalizar compra</h1>
      </div>

      <div className="checkout-steps">
        {[
          { id: 'shipping', label: 'Envio', Icon: MapPinIcon },
          { id: 'payment', label: 'Pago', Icon: CreditCardIcon },
        ].map((item, index) => {
          const active = step === item.id
          const done = item.id === 'shipping' && step === 'payment'
          return (
            <div className="checkout-step-wrap" key={item.id}>
              {index > 0 ? <span className="checkout-step-line" /> : null}
              <span
                className={
                  active ? 'checkout-step active' : done ? 'checkout-step done' : 'checkout-step'
                }
              >
                {done ? <CheckIcon size={14} /> : <item.Icon size={14} />}
                {item.label}
              </span>
            </div>
          )
        })}
      </div>

      <div className="checkout-layout">
        <div className="checkout-form-panel">
          {step === 'shipping' ? (
            <form className="checkout-form" onSubmit={handleShippingSubmit} noValidate>
              <h2>Datos de envio</h2>
              <div className="checkout-grid">
                <label className={shippingErrors.name ? 'has-error' : ''}>
                  Nombre completo
                  <input
                    name="name"
                    value={shippingForm.name}
                    onChange={updateShipping}
                    className={shippingErrors.name ? 'input-invalid' : ''}
                    autoComplete="name"
                  />
                  {shippingErrors.name ? (
                    <span className="checkout-field-hint">{shippingErrors.name}</span>
                  ) : null}
                </label>
                <label className={shippingErrors.email ? 'has-error' : ''}>
                  Email
                  <input
                    name="email"
                    type="email"
                    value={shippingForm.email}
                    onChange={updateShipping}
                    className={shippingErrors.email ? 'input-invalid' : ''}
                    autoComplete="email"
                  />
                  {shippingErrors.email ? (
                    <span className="checkout-field-hint">{shippingErrors.email}</span>
                  ) : null}
                </label>
                <label className={shippingErrors.phone ? 'has-error' : ''}>
                  Telefono
                  <input
                    name="phone"
                    value={shippingForm.phone}
                    onChange={updateShipping}
                    className={shippingErrors.phone ? 'input-invalid' : ''}
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="11 2345 6789"
                  />
                  {shippingErrors.phone ? (
                    <span className="checkout-field-hint">{shippingErrors.phone}</span>
                  ) : null}
                </label>
                <label className={`full-width${shippingErrors.address ? ' has-error' : ''}`}>
                  Direccion
                  <input
                    name="address"
                    value={shippingForm.address}
                    onChange={updateShipping}
                    className={shippingErrors.address ? 'input-invalid' : ''}
                    autoComplete="street-address"
                  />
                  {shippingErrors.address ? (
                    <span className="checkout-field-hint">{shippingErrors.address}</span>
                  ) : null}
                </label>
                <label className={shippingErrors.city ? 'has-error' : ''}>
                  Ciudad
                  <input
                    name="city"
                    value={shippingForm.city}
                    onChange={updateShipping}
                    className={shippingErrors.city ? 'input-invalid' : ''}
                    autoComplete="address-level2"
                  />
                  {shippingErrors.city ? (
                    <span className="checkout-field-hint">{shippingErrors.city}</span>
                  ) : null}
                </label>
                <label className={shippingErrors.postalCode ? 'has-error' : ''}>
                  Codigo postal
                  <input
                    name="postalCode"
                    value={shippingForm.postalCode}
                    onChange={updateShipping}
                    className={shippingErrors.postalCode ? 'input-invalid' : ''}
                    autoComplete="postal-code"
                    placeholder="1425"
                  />
                  {shippingErrors.postalCode ? (
                    <span className="checkout-field-hint">{shippingErrors.postalCode}</span>
                  ) : null}
                </label>
                <label className="full-width">
                  Notas (opcional)
                  <textarea
                    name="notes"
                    value={shippingForm.notes}
                    onChange={updateShipping}
                    rows="4"
                  />
                </label>
              </div>
              <button className="button checkout-btn full" type="submit">
                Continuar al pago
              </button>
              <Link className="checkout-back" to="/carrito">
                Volver al carrito
              </Link>
            </form>
          ) : (
            <div className="checkout-form">
              <h2>Metodo de pago</h2>
              <div className="payment-methods">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    className={
                      paymentMethod === method.id ? 'payment-method active' : 'payment-method'
                    }
                    onClick={() => setPaymentMethod(method.id)}
                  >
                    <CreditCardIcon size={18} />
                    <strong>{method.label}</strong>
                    <span>{method.description}</span>
                  </button>
                ))}
              </div>

              {selectedPayment?.requiresCard ? (
                <div className="checkout-grid payment-card-grid">
                  <label className={`full-width${paymentErrors.cardNumber ? ' has-error' : ''}`}>
                    Numero de tarjeta
                    <input
                      name="cardNumber"
                      value={cardForm.cardNumber}
                      onChange={updateCard}
                      className={paymentErrors.cardNumber ? 'input-invalid' : ''}
                      inputMode="numeric"
                      autoComplete="cc-number"
                      placeholder="4242 4242 4242 4242"
                    />
                    {paymentErrors.cardNumber ? (
                      <span className="checkout-field-hint">{paymentErrors.cardNumber}</span>
                    ) : null}
                  </label>
                  <label className={paymentErrors.expiry ? 'has-error' : ''}>
                    Vencimiento
                    <input
                      name="expiry"
                      value={cardForm.expiry}
                      onChange={updateCard}
                      className={paymentErrors.expiry ? 'input-invalid' : ''}
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      placeholder="MM/AA"
                      maxLength={5}
                    />
                    {paymentErrors.expiry ? (
                      <span className="checkout-field-hint">{paymentErrors.expiry}</span>
                    ) : null}
                  </label>
                  <label className={paymentErrors.cvv ? 'has-error' : ''}>
                    CVV
                    <input
                      name="cvv"
                      value={cardForm.cvv}
                      onChange={updateCard}
                      className={paymentErrors.cvv ? 'input-invalid' : ''}
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      placeholder="123"
                      maxLength={4}
                    />
                    {paymentErrors.cvv ? (
                      <span className="checkout-field-hint">{paymentErrors.cvv}</span>
                    ) : null}
                  </label>
                  <label className={`full-width${paymentErrors.cardName ? ' has-error' : ''}`}>
                    Nombre en la tarjeta
                    <input
                      name="cardName"
                      value={cardForm.cardName}
                      onChange={updateCard}
                      className={paymentErrors.cardName ? 'input-invalid' : ''}
                      autoComplete="cc-name"
                    />
                    {paymentErrors.cardName ? (
                      <span className="checkout-field-hint">{paymentErrors.cardName}</span>
                    ) : null}
                  </label>
                </div>
              ) : (
                <p className="payment-transfer-note">
                  Recibiras por email los datos de la cuenta para transferir{' '}
                  <strong>{formatPrice(total)}</strong>.
                </p>
              )}

              <p className="payment-secure-note">
                <CheckIcon size={16} />
                Pago simulado para demostracion. No se procesa un cobro real.
              </p>

              <div className="checkout-payment-actions">
                <button
                  className="button ghost"
                  type="button"
                  onClick={() => setStep('shipping')}
                >
                  Volver
                </button>
                <button
                  className="button checkout-btn"
                  type="button"
                  onClick={handleConfirmOrder}
                  disabled={loading}
                >
                  {loading ? 'Procesando...' : 'Confirmar compra'}
                </button>
              </div>
            </div>
          )}
        </div>

        <CheckoutSummary
          items={items}
          subtotal={subtotal}
          shipping={shippingCost}
          discountPercent={discountPercent}
          discountAmount={discountAmount}
          total={total}
        />
      </div>
    </section>
  )
}

export default Checkout
