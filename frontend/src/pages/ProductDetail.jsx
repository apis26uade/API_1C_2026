import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard.jsx'
import { useCart } from '../context/CartContext.jsx'
import { featuredProducts } from '../data/products.js'
import { getProductById } from '../services/api.js'

const formatPrice = (price) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(price)

function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const { addItem } = useCart()

  useEffect(() => {
    getProductById(id)
      .then((data) => {
        setProduct(data ?? null)
        setQuantity(1)
        setAdded(false)
      })
      .catch(() => setProduct(null))
  }, [id])

  if (!product) {
    return (
      <section className="section-container center-section">
        <p className="eyebrow">Detalle</p>
        <h1>Producto no encontrado</h1>
        <button className="button primary" type="button" onClick={() => navigate('/catalogo')}>
          Volver al catalogo
        </button>
      </section>
    )
  }

  const relatedProducts = featuredProducts
    .filter(
      (item) =>
        item.idProduct !== product.idProduct &&
        item.category?.idCategory === product.category?.idCategory,
    )
    .slice(0, 4)

  const stockLabel =
    product.stock === 0
      ? 'Sin stock'
      : product.stock <= 5
        ? `Solo quedan ${product.stock}`
        : `En stock (${product.stock} disponibles)`

  const handleAdd = () => {
    addItem(product, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2200)
  }

  return (
    <div className="detail-page">
      <div className="breadcrumb">
        <Link to="/">Inicio</Link>
        <span>/</span>
        <Link to="/catalogo">Catalogo</Link>
        <span>/</span>
        <Link to={`/catalogo?categoria=${product.category?.idCategory}`}>
          {product.category?.categoryName}
        </Link>
      </div>

      <section className="detail-layout">
        <div className="detail-media">
          <img src={product.imageProduct} alt={product.productName} />
          {product.stock > 0 && product.stock <= 5 ? (
            <span className="stock-badge">Ultimas unidades</span>
          ) : null}
        </div>

        <div className="detail-copy">
          <Link className="eyebrow" to={`/catalogo?categoria=${product.category?.idCategory}`}>
            {product.category?.categoryName}
          </Link>
          <h1>{product.productName}</h1>
          <strong className="detail-price">{formatPrice(product.price)}</strong>
          <p className="stock-note">{stockLabel}</p>
          <p className="detail-description">{product.productDescription}</p>

          {product.stock > 0 ? (
            <div className="quantity-control">
              <label htmlFor="quantity">Cantidad:</label>
              <div>
                <button
                  type="button"
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <input id="quantity" type="number" min="1" readOnly value={quantity} />
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((current) => Math.min(product.stock, current + 1))
                  }
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
            </div>
          ) : null}

          <button
            className={added ? 'button success full' : 'button primary full'}
            type="button"
            onClick={handleAdd}
            disabled={product.stock === 0}
          >
            {added ? 'Agregado!' : product.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
          </button>

          <div className="detail-features">
            <span>Materiales naturales y sostenibles</span>
            <span>Envio gratis en compras mayores a $150</span>
            <span>Cambios y devoluciones en 30 dias</span>
          </div>
        </div>
      </section>

      {relatedProducts.length ? (
        <section className="related-section">
          <h2>Tambien te puede gustar</h2>
          <div className="product-grid four">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.idProduct} product={relatedProduct} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}

export default ProductDetail
