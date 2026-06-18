import { useEffect, useState } from 'react'
import { PageError, PageLoader } from '../../components/AsyncState.jsx'
import {
  createProduct,
  deleteProduct,
  getCategories,
  getProducts,
  updateProduct,
} from '../../services/api.js'

const emptyForm = {
  idProduct: null,
  productName: '',
  productDescription: '',
  price: '',
  stock: '',
  imageProduct: '',
  categoryId: '',
}

const formatPrice = (price) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(price)

function AdminProducts() {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const loadData = () => {
    setLoading(true)
    setError('')
    Promise.all([getProducts(), getCategories()])
      .then(([nextProducts, nextCategories]) => {
        setProducts(nextProducts)
        setCategories(nextCategories)
        setForm((current) => ({
          ...current,
          categoryId: current.categoryId || String(nextCategories[0]?.idCategory ?? ''),
        }))
      })
      .catch((fetchError) => setError(fetchError.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  const closeForm = () => {
    setShowForm(false)
    setForm({ ...emptyForm, categoryId: String(categories[0]?.idCategory ?? '') })
  }

  const startEdit = (product) => {
    setForm({
      idProduct: product.idProduct,
      productName: product.productName,
      productDescription: product.productDescription,
      price: String(product.price),
      stock: String(product.stock),
      imageProduct: product.imageProduct,
      categoryId: String(product.category?.idCategory ?? categories[0]?.idCategory ?? ''),
    })
    setMessage('')
    setShowForm(true)
  }

  const startCreate = () => {
    setForm({ ...emptyForm, categoryId: String(categories[0]?.idCategory ?? '') })
    setMessage('')
    setShowForm(true)
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const buildPayload = () => ({
    productName: form.productName.trim(),
    productDescription: form.productDescription.trim(),
    price: Number(form.price),
    stock: Number(form.stock),
    imageProduct: form.imageProduct.trim(),
    category: { idCategory: Number(form.categoryId) },
  })

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      if (form.idProduct) {
        await updateProduct(form.idProduct, buildPayload())
        setMessage('Producto actualizado')
      } else {
        await createProduct(buildPayload())
        setMessage('Producto creado')
      }
      closeForm()
      loadData()
    } catch (submitError) {
      setMessage(submitError.message || 'No se pudo guardar el producto')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (idProduct) => {
    if (!window.confirm('Eliminar este producto?')) return
    setMessage('')
    try {
      await deleteProduct(idProduct)
      setMessage('Producto eliminado')
      loadData()
    } catch (deleteError) {
      setMessage(deleteError.message || 'No se pudo eliminar el producto')
    }
  }

  if (loading) {
    return <PageLoader message="Cargando productos..." />
  }

  if (error) {
    return <PageError message={error} onRetry={loadData} />
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <p className="eyebrow">Catalogo</p>
          <h1>Gestion de productos</h1>
        </div>
        <button className="button primary" type="button" onClick={startCreate}>
          Nuevo producto
        </button>
      </header>

      {message ? <p className="admin-flash">{message}</p> : null}

      <div className={showForm ? 'admin-split' : 'admin-split admin-split-list-only'}>
        {showForm ? (
        <section className="admin-card admin-card-form">
          <h2>{form.idProduct ? 'Editar producto' : 'Alta de producto'}</h2>
          <form className="admin-form admin-form-product" onSubmit={handleSubmit}>
            <label>
              Nombre
              <input name="productName" value={form.productName} onChange={handleChange} required />
            </label>
            <label>
              Descripcion
              <textarea
                name="productDescription"
                value={form.productDescription}
                onChange={handleChange}
                rows="3"
              />
            </label>
            <div className="admin-form-pair">
              <label>
                Precio (USD)
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Stock
                <input
                  name="stock"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>
            <label>
              Categoria
              <select name="categoryId" value={form.categoryId} onChange={handleChange}>
                {categories.map((category) => (
                  <option key={category.idCategory} value={category.idCategory}>
                    {category.categoryName}
                  </option>
                ))}
              </select>
            </label>
            <label>
              URL imagen
              <input name="imageProduct" value={form.imageProduct} onChange={handleChange} />
            </label>
            <div className="admin-form-actions">
              <button className="button primary" type="submit" disabled={saving}>
                {saving ? 'Guardando...' : form.idProduct ? 'Guardar cambios' : 'Crear producto'}
              </button>
              <button className="button secondary" type="button" onClick={closeForm}>
                Cancelar
              </button>
            </div>
          </form>
        </section>
        ) : null}

        <section className="admin-card admin-table-card">
          <h2>Productos ({products.length})</h2>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoria</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th className="admin-actions-col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.idProduct}>
                    <td>
                      <div className="admin-product-cell">
                        {product.imageProduct ? (
                          <img src={product.imageProduct} alt="" />
                        ) : null}
                        <span>{product.productName}</span>
                      </div>
                    </td>
                    <td>{product.category?.categoryName}</td>
                    <td>{formatPrice(product.price)}</td>
                    <td>{product.stock}</td>
                    <td className="admin-actions-col">
                      <div className="admin-row-actions">
                        <button type="button" onClick={() => startEdit(product)}>
                          Editar
                        </button>
                        <button type="button" onClick={() => handleDelete(product.idProduct)}>
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}

export default AdminProducts
