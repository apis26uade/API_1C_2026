const formatPrice = (price) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(price)

function CheckoutSummary({ items, subtotal, shipping, discountPercent, discountAmount, total }) {
  return (
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
        <span>Total</span>
        <strong>{formatPrice(total)}</strong>
      </div>
    </aside>
  )
}

export default CheckoutSummary
