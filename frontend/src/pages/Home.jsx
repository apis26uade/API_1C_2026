import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageError, PageLoader } from '../components/AsyncState.jsx'
import { HeartOutlineIcon, LeafIcon, RecycleIcon } from '../components/Icons.jsx'
import ProductCard from '../components/ProductCard.jsx'
import {
  categories as fallbackCategories,
  getCategoryImage,
  heroImage,
  philosophyImage,
} from '../data/products.js'
import { getCategories, getProducts } from '../services/api.js'
import { useToast } from '../context/ToastContext.jsx'

function Home() {
  const { toastSuccess } = useToast()
  const [products, setProducts] = useState([])
  const [catalogCategories, setCatalogCategories] = useState(fallbackCategories)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')

  const loadProducts = () => {
    setLoading(true)
    setError('')
    Promise.all([getProducts(), getCategories()])
      .then(([nextProducts, nextCategories]) => {
        setProducts(nextProducts)
        if (nextCategories.length > 0) {
          setCatalogCategories(nextCategories)
        }
      })
      .catch((fetchError) => setError(fetchError.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const handleNewsletter = (event) => {
    event.preventDefault()
    toastSuccess('Gracias por suscribirte!')
    setEmail('')
  }

  if (loading) {
    return <PageLoader message="Cargando catalogo..." />
  }

  if (error) {
    return <PageError message={error} onRetry={loadProducts} />
  }

  return (
    <>
      <section className="hero-section">
        <img src={heroImage} alt="Alma Boho hero" />
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-copy">
            <p className="eyebrow">Nueva Colección 2026</p>
            <h1>Moda que respira libertad</h1>
            <p>
              Prendas artesanales con alma, disenadas para la mujer que abraza
              su esencia natural y libre.
            </p>
            <div className="hero-actions">
              <Link className="button primary" to="/catalogo">
                Ver Colección
              </Link>
              <Link className="button ghost" to={`/catalogo?categoria=${catalogCategories[0]?.idCategory ?? 1}`}>
                Vestidos
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="values-strip">
        {[
          {
            Icon: LeafIcon,
            title: 'Materiales Naturales',
            subtitle: 'Lino, algodon y fibras organicas',
          },
          {
            Icon: RecycleIcon,
            title: 'Produccion Sostenible',
            subtitle: 'Packaging 100% reciclado',
          },
          {
            Icon: HeartOutlineIcon,
            title: 'Artesania Local',
            subtitle: 'Apoyamos comunidades artesanas',
          },
        ].map(({ Icon, title, subtitle }) => (
          <div key={title} className="value-item">
            <span className="value-item-icon" aria-hidden="true">
              <Icon />
            </span>
            <div>
              <strong>{title}</strong>
              <p>{subtitle}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="section-container">
        <div className="section-heading centered">
          <p className="eyebrow">Explorar por estilo</p>
          <h2>Nuestras Colecciones</h2>
        </div>
        <div className="category-grid">
          {catalogCategories.map((category) => (
            <Link
              className="category-card"
              key={category.idCategory}
              to={`/catalogo?categoria=${category.idCategory}`}
              aria-label={`Ver categoria ${category.categoryName}`}
            >
              <img src={getCategoryImage(category)} alt={category.categoryName} />
              <span>{category.categoryName}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="featured-section">
        <div className="section-container">
          <div className="section-heading split">
            <div>
              <p className="eyebrow">Lo mas nuevo</p>
              <h2>Nuevas Llegadas</h2>
            </div>
            <Link className="text-link" to="/catalogo">
              Ver todo
            </Link>
          </div>
          <div className="product-grid four">
            {products.slice(0, 4).map((product) => (
              <ProductCard key={product.idProduct} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="story-banner">
        <img src={philosophyImage} alt="El alma de Boho" />
        <div>
          <p className="eyebrow">Nuestra Filosofia</p>
          <h2>
            Cada prenda
            <br />
            cuenta una historia
          </h2>
          <p>
            Trabajamos con artesanas locales para crear prendas unicas que
            reflejan la riqueza cultural de nuestras raices. Cada bordado, cada
            puntada, es un acto de amor y tradicion.
          </p>
          <Link className="text-link underline" to="/catalogo">
            Descubrir mas
          </Link>
        </div>
      </section>

      <section className="section-container">
        <div className="section-heading split">
          <div>
            <p className="eyebrow">Para vos</p>
            <h2>Coleccion completa</h2>
          </div>
        </div>
        <div className="product-grid four">
          {products.slice(4, 8).map((product) => (
            <ProductCard key={product.idProduct} product={product} />
          ))}
        </div>
        <div className="center-actions">
          <Link className="button dark" to="/catalogo">
            Ver catalogo completo
          </Link>
        </div>
      </section>

      <section className="newsletter-section">
        <div>
          <p className="eyebrow">Comunidad Boho</p>
          <h2>Se la primera en enterarte</h2>
          <p>
            Nuevas colecciones, descuentos exclusivos y tips de estilo
            directamente en tu bandeja.
          </p>
          <form onSubmit={handleNewsletter} className="newsletter-form">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="tu@email.com"
              required
            />
            <button type="submit">Suscribirme</button>
          </form>
        </div>
      </section>
    </>
  )
}

export default Home
