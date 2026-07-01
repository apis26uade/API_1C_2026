import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageError, PageLoader } from '../components/AsyncState.jsx'
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice.js';
import { loginUser, registerUser } from '../features/auth/authThunks.js';
import { getUserOrdersWithItems, mapOrdersWithItems } from '../services/api.js'
import { formatOrderId, ORDER_STATUSES } from '../services/orders.js'

const formatPrice = (price) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(price)

const statusLabel = (value) =>
  ORDER_STATUSES.find((status) => status.value === value)?.label ?? value

function Orders() {
    const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadOrders = () => {
    if (!user?.idUser) return
    setLoading(true)
    setError('')
    getUserOrdersWithItems(user.idUser)
      .then(mapOrdersWithItems)
      .then(setOrders)
      .catch((fetchError) => setError(fetchError.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadOrders()
  }, [user?.idUser])

  if (loading) {
    return <PageLoader message="Cargando pedidos..." />
  }

  if (error) {
    return <PageError message={error} onRetry={loadOrders} />
  }

  return (
    <section className="orders-page section-container">
      <div className="orders-header">
        <p className="eyebrow">Tu cuenta</p>
        <h1>Mis pedidos</h1>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state card-panel">
          <h2>Todavia no tenes pedidos</h2>
          <p>Cuando confirmes una compra, aparecera el historial aqui.</p>
          <Link className="button primary" to="/catalogo">
            Ir al catalogo
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <article className="order-card" key={order.idOrder}>
              <div className="order-card-top">
                <div className="order-card-info">
                  <h2>Pedido #{formatOrderId(order.idOrder)}</h2>
                  <p className="order-card-meta">
                    {order.items.length} articulo{order.items.length !== 1 ? 's' : ''}
                    {order.discountCode ? ` · Descuento ${order.discountCode}` : ''}
                  </p>
                </div>
                <span
                  className={`order-status-badge status-${order.status.toLowerCase()}`}
                >
                  {statusLabel(order.status)}
                </span>
              </div>
              <div className="order-card-foot">
                <strong className="order-card-total">{formatPrice(order.total)}</strong>
                <Link className="order-card-link" to={`/pedidos/${order.idOrder}`}>
                  Ver detalle
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default Orders
