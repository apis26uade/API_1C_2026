import { NavLink, Outlet, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

const adminLinks = [
  { to: '/admin/productos', label: 'Productos' },
  { to: '/admin/categorias', label: 'Categorias' },
  { to: '/admin/pedidos', label: 'Pedidos' },
]

function AdminLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-head">
          <p className="eyebrow">Panel</p>
          <h2>Alma Boho</h2>
          <p className="admin-user">{user?.email}</p>
        </div>
        <nav className="admin-nav">
          {adminLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar-foot">
          <Link className="admin-foot-link" to="/">
            Volver a la tienda
          </Link>
          <button className="admin-foot-link" type="button" onClick={logout}>
            Cerrar sesion
          </button>
        </div>
      </aside>
      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  )
}

export default AdminLayout
