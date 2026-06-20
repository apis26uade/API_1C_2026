import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageError, PageLoader } from '../../components/AsyncState.jsx'
import { ArrowRightIcon } from '../../components/Icons.jsx'
import AdminStatusPicker from '../../components/admin/AdminStatusPicker.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { getOrdersWithItems, mapOrdersWithItems, updateOrderStatus } from '../../services/api.js'
import { formatOrderId } from '../../services/orders.js'

const formatPrice = (price) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(price)

function AdminOrders() {
  const { toastSuccess, toastError } = useToast()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  const loadOrders = () => {
    setLoading(true)
    setError('')
    getOrdersWithItems()
      .then(mapOrdersWithItems)
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
      toastSuccess('Estado del pedido actualizado')
    } catch (updateError) {
      toastError(updateError.message || 'No se pudo actualizar el estado')
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
          {orders.length > 0 ? (
            <p className="admin-page-subtitle">
              {orders.length} pedido{orders.length !== 1 ? 's' : ''} registrado
              {orders.length !== 1 ? 's' : ''}
            </p>
          ) : null}
        </div>
      </header>

      {orders.length === 0 ? (
        <div className="admin-card empty-state">
          <h2>Sin pedidos aun</h2>
          <p>Cuando un cliente confirme una compra, aparecera aqui.</p>
        </div>
      ) : (
        <div className="orders-list admin-orders-list">
          {orders.map((order) => (
            <article className="order-card admin-order-card" key={order.idOrder}>
              <div className="admin-order-card-head">
                <div className="order-card-info">
                  <h2>Pedido #{formatOrderId(order.idOrder)}</h2>
                  <p className="order-card-meta">{order.userEmail}</p>
                </div>

                <AdminStatusPicker
                  value={order.status}
                  disabled={updatingId === order.idOrder}
                  onChange={(status) => handleStatusChange(order.idOrder, status)}
                />
              </div>

              {order.shipping?.name ? (
                <div className="admin-order-shipping">
                  <p className="admin-order-shipping-label">Envio</p>
                  <div className="admin-order-shipping-grid">
                    <div>
                      <strong>{order.shipping.name}</strong>
                      <span>{order.shipping.email}</span>
                      <span>{order.shipping.phone}</span>
                    </div>
                    <div>
                      <span>{order.shipping.address}</span>
                      <span>
                        {order.shipping.city}, CP {order.shipping.postalCode}
                      </span>
                      {order.shipping.notes ? (
                        <span className="admin-order-shipping-notes">{order.shipping.notes}</span>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="admin-order-shipping-missing">Sin datos de envio registrados</p>
              )}

              <div className="admin-order-body">
                {order.items.length > 0 ? (
                  <ul className="admin-order-item-list">
                    {order.items.map((item) => (
                      <li className="admin-order-item-chip" key={`${order.idOrder}-${item.idProduct}`}>
                        {item.imageProduct ? (
                          <img src={item.imageProduct} alt="" />
                        ) : (
                          <span className="admin-order-item-placeholder" aria-hidden="true" />
                        )}
                        <span>
                          <strong>{item.productName}</strong>
                          <small>x{item.quantity}</small>
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="admin-order-empty-items">
                    Sin detalle de productos
                    {order.status === 'CANCELLED' ? ' (pedido cancelado)' : ''}
                  </p>
                )}

                {order.discountCode ? (
                  <p className="admin-order-discount">
                    Descuento aplicado: <strong>{order.discountCode}</strong>
                  </p>
                ) : null}
              </div>

              <div className="order-card-foot admin-order-foot">
                <div className="admin-order-total-wrap">
                  <span className="admin-order-total-label">Total</span>
                  <strong className="order-card-total">{formatPrice(order.total)}</strong>
                </div>
                <Link className="admin-order-view-link" to={`/pedidos/${order.idOrder}`}>
                  Ver como cliente
                  <ArrowRightIcon size={14} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminOrders
