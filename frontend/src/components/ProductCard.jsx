import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux';
import { addLocalItem, updateLocalItemQuantity, removeLocalItem, clearCart } from '../features/cart/cartSlice.js';

const formatPrice = (price) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(price)

function ProductCard({ product }) {
    const dispatch = useDispatch();
  const { items, itemCount, subtotal, total, appliedDiscount } = useSelector(state => state.cart);
  const addItem = (product, quantity = 1) => dispatch(addLocalItem({ product, quantity }));
  const categoryName = product.category?.categoryName ?? product.category ?? 'Coleccion'

  const handleAddToCart = (event) => {
    event.preventDefault()
    event.stopPropagation()
    if (product.stock > 0) addItem(product, 1)
  }

  return (
    <article className="product-card group-card">
      <div className="product-media-wrap">
        <Link className="product-media" to={`/producto/${product.idProduct}`}>
          {product.imageProduct ? (
            <img src={product.imageProduct} alt={product.productName} />
          ) : (
            <span>{categoryName}</span>
          )}
          {product.stock === 0 ? <span className="stock-badge soldout">Sin stock</span> : null}
          {product.stock > 0 && product.stock <= 5 ? (
            <span className="stock-badge">Ultimas {product.stock}</span>
          ) : null}
          <button className="wishlist-button" type="button" aria-label="Guardar favorito">
            Favorito
          </button>
        </Link>
        <button
          className="card-overlay"
          type="button"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
        >
          Agregar al carrito
        </button>
      </div>

      <div className="product-info">
        <p className="eyebrow">{categoryName}</p>
        <h3>{product.productName}</h3>
        <div className="product-actions">
          <strong>{formatPrice(product.price)}</strong>
          <Link className="text-link" to={`/detalle/${product.idProduct}`}>
            Ver detalle
          </Link>
        </div>
      </div>
    </article>
  )
}

export default ProductCard
