import { NavLink, Outlet, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../features/auth/authSlice.js'
import { selectUser } from '../../features/auth/authSelectors.js'
import { resetToLocalCart } from '../../features/cart/cartSlice.js'

const adminLinks = [
  { to: '/admin/productos', label: 'Productos' },
  { to: '/admin/categorias', label: 'Categorias' },
  { to: '/admin/pedidos', label: 'Pedidos' },
]

function AdminLayout() {
  const dispatch = useDispatch()
  const user = useSelector(selectUser)

  const handleLogout = () => {
    dispatch(logout())
    dispatch(resetToLocalCart())
  }

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
          <button className="admin-foot-link" type="button" onClick={handleLogout}>
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
