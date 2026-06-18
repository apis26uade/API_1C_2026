import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageError, PageLoader } from '../components/AsyncState.jsx'
import { ArrowLeftIcon, CheckIcon, LeafIcon } from '../components/Icons.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { useCart } from '../context/CartContext.jsx'
import { getProductById, getProducts } from '../services/api.js'

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
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCart()

  const loadProduct = () => {
    setLoading(true)
    setError('')
    setNotFound(false)

    Promise.all([getProductById(id), getProducts()])
      .then(([nextProduct, allProducts]) => {
        setProduct(nextProduct)
        setRelatedProducts(
          allProducts
            .filter(
              (item) =>
                item.idProduct !== nextProduct.idProduct &&
                item.category?.idCategory === nextProduct.category?.idCategory,
            )
            .slice(0, 4),
        )
      })
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
    loadProduct()
  }, [id])

  if (loading) {
    return <PageLoader message="Cargando producto..." />
  }

  if (error) {
    return <PageError message={error} onRetry={loadProduct} />
  }

  if (notFound || !product) {
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

  const stockLabel =
    product.stock === 0
      ? 'Sin stock'
      : product.stock <= 5
        ? `Solo quedan ${product.stock}`
        : `En stock (${product.stock} disponibles)`

  const handleAdd = () => {
    addItem(product, quantity)
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
            className="button primary full"
            type="button"
            onClick={handleAdd}
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
          </button>

          <div className="detail-features">
            <div className="detail-feature">
              <LeafIcon size={18} />
              <span>Materiales naturales y sostenibles</span>
            </div>
            <div className="detail-feature">
              <CheckIcon size={18} />
              <span>Envio gratis en compras mayores a $150</span>
            </div>
            <div className="detail-feature">
              <ArrowLeftIcon size={18} />
              <span>Cambios y devoluciones en 30 dias</span>
            </div>
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
