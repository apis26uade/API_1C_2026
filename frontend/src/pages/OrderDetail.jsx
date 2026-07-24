import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageError, PageLoader } from '../components/AsyncState.jsx'
import { useSelector } from 'react-redux'
import { selectIsAdmin, selectUser } from '../features/auth/authSelectors.js'
import { fetchOrderDetail } from '../services/api.js'
import { formatOrderId, ORDER_STATUSES } from '../services/orders.js'

const formatPrice = (price) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(price)

const statusLabel = (value) =>
  ORDER_STATUSES.find((status) => status.value === value)?.label ?? value

function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useSelector(selectUser)
  const isAdmin = useSelector(selectIsAdmin)
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)

  const loadOrder = () => {
    setLoading(true)
    setError('')
    setNotFound(false)
    fetchOrderDetail(id)
      .then(setOrder)
      .catch((fetchError) => {
        if (fetchError.status === 404) {
          setNotFound(true)
        } else {
          setError(fetchError.message)
        }
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadOrder()
  }, [id])

  if (loading) {
    return <PageLoader message="Cargando pedido..." />
  }

  if (error) {
    return <PageError message={error} onRetry={loadOrder} />
  }

  if (notFound || !order) {
    return (
      <section className="section-container center-section">
        <h1>Pedido no encontrado</h1>
        <Link className="button primary" to="/pedidos">
          Volver a mis pedidos
        </Link>
      </section>
    )
  }

  const canView = isAdmin || order.userId === user?.idUser

  if (!canView) {
    return (
      <section className="section-container center-section">
        <h1>No tenes acceso a este pedido</h1>
        <button className="button primary" type="button" onClick={() => navigate('/pedidos')}>
          Ir a mis pedidos
        </button>
      </section>
    )
  }

  return (
    <section className="order-detail-page section-container">
      <div className="breadcrumb">
        <Link to="/">Inicio</Link>
        <span>/</span>
        <Link to="/pedidos">Mis pedidos</Link>
        <span>/</span>
        <span>#{formatOrderId(order.idOrder)}</span>
      </div>

      <header className="order-detail-header">
        <div>
          <p className="eyebrow">Confirmacion</p>
          <h1>Pedido #{formatOrderId(order.idOrder)}</h1>
          {order.userEmail ? <p>{order.userEmail}</p> : null}
        </div>
        <span className={`order-status-badge status-${order.status.toLowerCase()}`}>
          {statusLabel(order.status)}
        </span>
      </header>

      <div className="order-detail-layout">
        <section className="card-panel">
          <h2>Productos</h2>
          <ul className="order-detail-items">
            {order.items.map((item) => (
              <li key={`${order.idOrder}-${item.idProduct}`}>
                {item.imageProduct ? (
                  <img src={item.imageProduct} alt="" />
                ) : (
                  <span className="order-item-placeholder" />
                )}
                <div>
                  <strong>{item.productName}</strong>
                  <p>
                    {item.quantity} x {formatPrice(item.unitPrice)}
                  </p>
                </div>
                <strong>{formatPrice(item.unitPrice * item.quantity)}</strong>
              </li>
            ))}
          </ul>
          <div className="cart-summary-row">
            <span>Subtotal</span>
            <strong>{formatPrice(order.subtotal)}</strong>
          </div>
          {order.discountAmount > 0 ? (
            <div className="cart-summary-row discount-row">
              <span>Descuento{order.discountCode ? ` (${order.discountCode})` : ''}</span>
              <strong>-{formatPrice(order.discountAmount)}</strong>
            </div>
          ) : null}
          <div className="cart-summary-row checkout-total">
            <span>Total pagado</span>
            <strong>{formatPrice(order.total)}</strong>
          </div>
        </section>

        <aside className="order-detail-side">
          <section className="card-panel">
            <h2>Estado</h2>
            <p>{statusLabel(order.status)}</p>
          </section>

          {order.shipping?.name ? (
            <section className="card-panel">
              <h2>Envio</h2>
              <ul className="order-shipping-list">
                <li>
                  <strong>{order.shipping.name}</strong>
                </li>
                <li>{order.shipping.email}</li>
                <li>{order.shipping.phone}</li>
                <li>{order.shipping.address}</li>
                <li>
                  {order.shipping.city}, CP {order.shipping.postalCode}
                </li>
                {order.shipping.notes ? <li>{order.shipping.notes}</li> : null}
              </ul>
            </section>
          ) : null}
        </aside>
      </div>

      <Link className="button primary" to="/catalogo">
        Seguir comprando
      </Link>
    </section>
  )
}

export default OrderDetail
