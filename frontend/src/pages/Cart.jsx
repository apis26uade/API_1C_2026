import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRightIcon, TagIcon, TrashIcon } from '../components/Icons.jsx'
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice.js';
import { loginUser, registerUser } from '../features/auth/authThunks.js';
import { addLocalItem, updateLocalItemQuantity, removeLocalItem, clearCart } from '../features/cart/cartSlice.js';
import { useToast } from '../context/ToastContext.jsx'
import { getDiscountByCode } from '../services/api.js'

const formatPrice = (price) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(price)

function Cart() {
  const navigate = useNavigate()
    const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const { toastSuccess, toastError } = useToast()
    const { items, itemCount, subtotal, total, appliedDiscount } = useSelector(state => state.cart);
  const removeItem = (id) => dispatch(removeLocalItem(id));
  const updateQuantity = (idProduct, quantity) => dispatch(updateLocalItemQuantity({ idProduct, quantity }));
  const [discountInput, setDiscountInput] = useState('')
  const [applyingDiscount, setApplyingDiscount] = useState(false)

  useEffect(() => {
    if (isAuthenticated && !syncing) {
      refreshCart()
    }
  }, [isAuthenticated, syncing, refreshCart])

  const handleApplyDiscount = async (event) => {
    event.preventDefault()
    if (applyingDiscount) return

    const code = discountInput.trim()
    if (!code) return

    if (!isAuthenticated) {
      toastError('Inicia sesion para aplicar un codigo de descuento')
      return
    }

    if (appliedDiscount) {
      if (appliedDiscount.code.toUpperCase() === code.toUpperCase()) {
        toastError('Ese codigo ya esta aplicado en esta compra')
        return
      }
      toastError('Solo podes usar un codigo por compra. Quita el actual para cambiar.')
      return
    }

    setApplyingDiscount(true)
    try {
      const discount = await getDiscountByCode(code)
      applyDiscount(discount)
      setDiscountInput('')
      toastSuccess(`Codigo ${discount.code} aplicado (${discount.percentage}%)`)
    } catch (discountError) {
      toastError(discountError.message || 'Codigo invalido')
    } finally {
      setApplyingDiscount(false)
    }
  }

  const handleRemoveDiscount = () => {
    clearDiscount()
    toastSuccess('Codigo de descuento quitado')
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

            {appliedDiscount ? (
              <div className="cart-applied-discount">
                <span>
                  <strong>{appliedDiscount.code}</strong> ({appliedDiscount.percentage}%)
                </span>
                <button className="text-link" type="button" onClick={handleRemoveDiscount}>
                  Quitar
                </button>
              </div>
            ) : (
              <div className="discount-row">
                <input
                  value={discountInput}
                  onChange={(event) => setDiscountInput(event.target.value)}
                  placeholder="Tu codigo"
                />
                <button className="button apply-discount" type="submit" disabled={applyingDiscount}>
                  {applyingDiscount ? 'Validando...' : 'Aplicar'}
                </button>
              </div>
            )}

            <p className="checkout-field-hint">Solo un codigo por compra.</p>
          </form>

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
              <span>Descuento ({discountCode}, {discountPercent}%)</span>
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
