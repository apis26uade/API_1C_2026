import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageError, PageLoader } from '../../components/AsyncState.jsx'
import { fetchOrdersWithItems, getOrders, updateOrderStatus } from '../../services/api.js'
import { ORDER_STATUSES } from '../../services/orders.js'

const formatPrice = (price) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(price)

function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  const loadOrders = () => {
    setLoading(true)
    setError('')
    getOrders()
      .then((rawOrders) => fetchOrdersWithItems(rawOrders))
      .then(setOrders)
      .catch((fetchError) => setError(fetchError.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const handleStatusChange = async (idOrder, status) => {
    setUpdatingId(idOrder)
    try {
      await updateOrderStatus(idOrder, status)
      setOrders((current) =>
        current.map((order) =>
          order.idOrder === idOrder ? { ...order, status } : order,
        ),
      )
    } catch (updateError) {
      setError(updateError.message || 'No se pudo actualizar el estado')
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) {
    return <PageLoader message="Cargando pedidos..." />
  }

  if (error && orders.length === 0) {
    return <PageError message={error} onRetry={loadOrders} />
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <p className="eyebrow">Ventas</p>
          <h1>Pedidos</h1>
        </div>
      </header>

      {error ? <p className="auth-error">{error}</p> : null}

      {orders.length === 0 ? (
        <div className="admin-card empty-state">
          <h2>Sin pedidos aun</h2>
          <p>Cuando un cliente confirme una compra, aparecera aqui.</p>
        </div>
      ) : (
        <div className="admin-orders-list">
          {orders.map((order) => (
            <article className="admin-card admin-order-card" key={order.idOrder}>
              <div className="admin-order-head">
                <div>
                  <h2>Pedido #{order.idOrder}</h2>
                  <p>{order.userEmail}</p>
                </div>
                <div className="admin-order-meta">
                  <label>
                    Estado
                    <select
                      value={order.status}
                      disabled={updatingId === order.idOrder}
                      onChange={(event) =>
                        handleStatusChange(order.idOrder, event.target.value)
                      }
                    >
                      {ORDER_STATUSES.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <strong>{formatPrice(order.total)}</strong>
                </div>
              </div>
              <div className="admin-order-grid">
                <div>
                  <p className="admin-label">Items</p>
                  <ul className="admin-order-items">
                    {order.items.map((item) => (
                      <li key={`${order.idOrder}-${item.idProduct}`}>
                        {item.productName} x{item.quantity}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <Link className="text-link" to={`/pedidos/${order.idOrder}`}>
                Ver como cliente
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminOrders
