import { useEffect, useState } from 'react'
import { PageError, PageLoader } from '../../components/AsyncState.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '../../services/api.js'

const emptyForm = { idCategory: null, categoryName: '' }

function AdminCategories() {
  const { toastSuccess, toastError, confirmAction } = useToast()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const loadCategories = () => {
    setLoading(true)
    setError('')
    getCategories()
      .then(setCategories)
      .catch((fetchError) => setError(fetchError.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadCategories()
  }, [])

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
        await updateCategory(form.idCategory, name)
        toastSuccess('Categoria actualizada')
      } else {
        await createCategory(name)
        toastSuccess('Categoria creada')
      }
      closeForm()
      loadCategories()
    } catch (submitError) {
      toastError(submitError.message || 'No se pudo guardar la categoria')
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
      await deleteCategory(category.idCategory)
      toastSuccess('Categoria eliminada')
      loadCategories()
    } catch (deleteError) {
      toastError(deleteError.message || 'No se pudo eliminar la categoria')
    }
  }

  if (loading) {
    return <PageLoader message="Cargando categorias..." />
  }

  if (error) {
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
