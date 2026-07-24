import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { PageError, PageLoader } from '../../components/AsyncState.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
} from '../../features/products/productThunks.js'

const emptyForm = { idCategory: null, categoryName: '' }

function AdminCategories() {
  const dispatch = useDispatch()
  const { toastSuccess, toastError, confirmAction } = useToast()
  const categories = useSelector((state) => state.products.categories)
  const error = useSelector((state) => state.products.error)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(categories.length === 0)

  const loadCategories = () => {
    setLoading(true)
    dispatch(fetchCategories())
      .unwrap()
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (categories.length === 0) {
      loadCategories()
    }
  }, [dispatch])

  const closeForm = () => {
    setShowForm(false)
    setForm(emptyForm)
  }

  const startCreate = () => {
    setForm(emptyForm)
    setShowForm(true)
  }

  const startEdit = (category) => {
    setForm({
      idCategory: category.idCategory,
      categoryName: category.categoryName,
    })
    setShowForm(true)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const name = form.categoryName.trim()
    if (!name) {
      toastError('El nombre de la categoria es obligatorio')
      return
    }

    setSaving(true)
    try {
      if (form.idCategory) {
        await dispatch(updateCategory({ id: form.idCategory, categoryName: name })).unwrap()
        toastSuccess('Categoria actualizada')
      } else {
        await dispatch(createCategory(name)).unwrap()
        toastSuccess('Categoria creada')
      }
      closeForm()
    } catch (submitError) {
      toastError(submitError || 'No se pudo guardar la categoria')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (category) => {
    const confirmed = await confirmAction({
      title: 'Eliminar categoria',
      message: `Queres eliminar "${category.categoryName}"? Solo es posible si no tiene productos asociados.`,
      confirmLabel: 'Eliminar',
      cancelLabel: 'Cancelar',
      destructive: true,
    })
    if (!confirmed) return

    try {
      await dispatch(deleteCategory(category.idCategory)).unwrap()
      toastSuccess('Categoria eliminada')
    } catch (deleteError) {
      toastError(deleteError || 'No se pudo eliminar la categoria')
    }
  }

  if (loading) {
    return <PageLoader message="Cargando categorias..." />
  }

  if (error && categories.length === 0) {
    return <PageError message={error} onRetry={loadCategories} />
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <p className="eyebrow">Catalogo</p>
          <h1>Categorias</h1>
          <p className="admin-page-subtitle">
            {categories.length} categoria{categories.length !== 1 ? 's' : ''} en la tienda
          </p>
        </div>
        <button className="button primary" type="button" onClick={startCreate}>
          Nueva categoria
        </button>
      </header>

      <div className={showForm ? 'admin-split' : 'admin-split admin-split-list-only'}>
        {showForm ? (
          <section className="admin-card admin-card-form">
            <h2>{form.idCategory ? 'Editar categoria' : 'Alta de categoria'}</h2>
            <form className="admin-form admin-form-product" onSubmit={handleSubmit}>
              <label className="full-width">
                Nombre
                <input
                  name="categoryName"
                  value={form.categoryName}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, categoryName: event.target.value }))
                  }
                  placeholder="Ej: Vestidos"
                  required
                />
              </label>
              <div className="admin-form-actions">
                <button className="button primary" type="submit" disabled={saving}>
                  {saving ? 'Guardando...' : form.idCategory ? 'Guardar cambios' : 'Crear categoria'}
                </button>
                <button className="button secondary" type="button" onClick={closeForm}>
                  Cancelar
                </button>
              </div>
            </form>
          </section>
        ) : null}

        <section className="admin-card">
          <h2>Listado ({categories.length})</h2>
          {categories.length === 0 ? (
            <p className="admin-empty-copy">Todavia no hay categorias. Crea la primera para organizar el catalogo.</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th className="admin-actions-col">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.idCategory}>
                      <td>{category.idCategory}</td>
                      <td>{category.categoryName}</td>
                      <td className="admin-actions-col">
                        <div className="admin-row-actions">
                          <button type="button" onClick={() => startEdit(category)}>
                            Editar
                          </button>
                          <button type="button" onClick={() => handleDelete(category)}>
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default AdminCategories
