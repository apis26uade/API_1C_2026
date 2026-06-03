import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronDownIcon } from '../components/Icons.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { categories as fallbackCategories, featuredProducts } from '../data/products.js'
import { getCategories, getProducts } from '../services/api.js'

const sortOptions = [
  { value: 'default', label: 'Destacados' },
  { value: 'price-asc', label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a menor' },
  { value: 'name', label: 'Nombre A-Z' },
]

const priceRanges = [
  { label: 'Hasta $50', min: 0, max: 50 },
  { label: '$50 - $80', min: 50, max: 80 },
  { label: '$80 - $110', min: 80, max: 110 },
  { label: 'Mas de $110', min: 110, max: 999 },
]

function Products() {
  const { isAuthenticated } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState(featuredProducts)
  const [categories, setCategories] = useState(fallbackCategories)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const search = searchParams.get('q') ?? ''
  const selectedCategory = searchParams.get('categoria')
    ? Number(searchParams.get('categoria'))
    : null
  const sort = searchParams.get('orden') ?? 'default'
  const minPrice = searchParams.get('minPrecio') ? Number(searchParams.get('minPrecio')) : 0
  const maxPrice = searchParams.get('maxPrecio') ? Number(searchParams.get('maxPrecio')) : 999

  const setFilter = (key, value) => {
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams)
      if (!value) {
        nextParams.delete(key)
      } else {
        nextParams.set(key, value)
      }
      return nextParams
    })
  }

  useEffect(() => {
    Promise.all([getProducts(), getCategories()])
      .then(([apiProducts, apiCategories]) => {
        setProducts(apiProducts)
        setCategories(apiCategories)
      })
      .catch(() => {
        setProducts(featuredProducts)
        setCategories(fallbackCategories)
      })
      .finally(() => setLoading(false))
  }, [isAuthenticated])

  const filteredProducts = useMemo(
    () => {
      const normalizedSearch = search.toLowerCase()
      const result = products.filter((product) => {
        const matchesSearch =
          !search ||
          `${product.productName} ${product.productDescription}`
            .toLowerCase()
            .includes(normalizedSearch)
        const matchesCategory =
          !selectedCategory || product.category?.idCategory === selectedCategory
        const matchesPrice = product.price >= minPrice && product.price <= maxPrice

        return matchesSearch && matchesCategory && matchesPrice
      })

      if (sort === 'price-asc') return result.sort((a, b) => a.price - b.price)
      if (sort === 'price-desc') return result.sort((a, b) => b.price - a.price)
      if (sort === 'name') {
        return result.sort((a, b) => a.productName.localeCompare(b.productName))
      }

      return result
    },
    [maxPrice, minPrice, products, search, selectedCategory, sort],
  )

  const activeCategory = categories.find(
    (category) => category.idCategory === selectedCategory,
  )
  const hasFilters = Boolean(search || selectedCategory || sort !== 'default')

  return (
    <section className="catalog-page">
      <div className="catalog-header">
        <p className="eyebrow">{activeCategory ? activeCategory.categoryName : 'Todo'}</p>
        <h1>{activeCategory ? activeCategory.categoryName : 'Catalogo'}</h1>
      </div>

      <div className="catalog-toolbar">
        <div className="search-field">
        <input
          type="search"
          value={search}
          onChange={(event) => setFilter('q', event.target.value)}
          placeholder="Buscar prendas..."
        />
          {search ? (
            <button type="button" onClick={() => setFilter('q', null)}>
              Limpiar
            </button>
          ) : null}
        </div>
        <div className="sort-field">
          <select
            value={sort}
            onChange={(event) => setFilter('orden', event.target.value)}
            aria-label="Ordenar productos"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="sort-field-icon" aria-hidden="true">
            <ChevronDownIcon size={14} />
          </span>
        </div>
        <button
          className="filter-toggle"
          type="button"
          onClick={() => setFiltersOpen((current) => !current)}
        >
          Filtros
        </button>
      </div>

      <div className="catalog-layout">
        <aside className={filtersOpen ? 'filters-panel open' : 'filters-panel'}>
          <div className="filters-box">
            <div className="filters-title">
              <h3>Filtros</h3>
              {hasFilters ? (
                <button type="button" onClick={() => setSearchParams({})}>
                  Limpiar
                </button>
              ) : null}
            </div>

            <div className="filter-group">
              <p>Categoria</p>
              <button
                type="button"
                className={!selectedCategory ? 'active' : ''}
                onClick={() => setFilter('categoria', null)}
              >
                Todas
              </button>
              {categories.map((category) => (
                <button
                  key={category.idCategory}
                  type="button"
                  className={selectedCategory === category.idCategory ? 'active' : ''}
                  onClick={() => setFilter('categoria', String(category.idCategory))}
                >
                  {category.categoryName}
                </button>
              ))}
            </div>

            <div className="filter-group">
              <p>Precio</p>
              {priceRanges.map((range) => {
                const active = minPrice === range.min && maxPrice === range.max
                return (
                  <button
                    key={range.label}
                    type="button"
                    className={active ? 'active' : ''}
                    onClick={() => {
                      if (active) {
                        setFilter('minPrecio', null)
                        setFilter('maxPrecio', null)
                      } else {
                        setFilter('minPrecio', String(range.min))
                        setFilter('maxPrecio', String(range.max))
                      }
                    }}
                  >
                    {range.label}
                  </button>
                )
              })}
            </div>
          </div>
        </aside>

        <div className="catalog-results">
          <p className="result-count">
            {loading
              ? 'Cargando...'
              : `${filteredProducts.length} producto${filteredProducts.length !== 1 ? 's' : ''}`}
          </p>

          {filteredProducts.length ? (
            <div className="product-grid catalog">
              {filteredProducts.map((product) => (
                <ProductCard key={product.idProduct} product={product} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h2>Sin resultados</h2>
              <p>Intenta con otros terminos o limpia los filtros.</p>
              <button type="button" onClick={() => setSearchParams({})}>
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default Products
