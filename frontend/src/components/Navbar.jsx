import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../features/auth/authSlice.js'
import { selectIsAuthenticated, selectUser } from '../features/auth/authSelectors.js'
import { selectItemCount } from '../features/cart/cartSelectors.js'
import { resetToLocalCart } from '../features/cart/cartSlice.js'
import { fetchCategories } from '../features/products/productThunks.js'
import { categories as fallbackCategories } from '../data/products.js'
import { ChevronDownIcon, ShoppingBagIcon } from './Icons.jsx'

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  
  const dispatch = useDispatch()
  const user = useSelector(selectUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isAdmin = user?.role === 'ROLE_ADMIN'
  const itemCount = useSelector(selectItemCount)
  const categories = useSelector((state) => state.products.categories)
  const categoriesStatus = useSelector((state) => state.products.status)
  const displayCategories = categories.length > 0 ? categories : fallbackCategories

  useEffect(() => {
    if (categoriesStatus === 'idle') {
      dispatch(fetchCategories())
    }
  }, [categoriesStatus, dispatch])

  const closeMobileMenu = () => setMobileOpen(false)
  const handleLogout = () => {
    dispatch(logout())
    dispatch(resetToLocalCart())
    closeMobileMenu()
  }

  return (
    <header className="navbar">
      <div className="nav-inner">
        <Link className="brand" to="/" aria-label="Ir al inicio">
          <span>alma</span>
          <strong>Boho</strong>
        </Link>

        <nav className="nav-links" aria-label="Navegacion principal">
          <NavLink to="/">Inicio</NavLink>
          <NavLink to="/catalogo">Catalogo</NavLink>
          <div className="nav-dropdown">
            <span className="nav-dropdown-trigger">
              Colecciones
              <span className="nav-dropdown-chevron">
                <ChevronDownIcon />
              </span>
            </span>
            <div className="collections-menu">
              <p>Explorar por categoria</p>
              {displayCategories.map((category) => (
                <Link
                  key={category.idCategory}
                  to={`/catalogo?categoria=${category.idCategory}`}
                >
                  {category.categoryName}
                </Link>
              ))}
            </div>
          </div>
          <NavLink to="/contacto">Contacto</NavLink>
        </nav>

        <div className="nav-actions">
          {isAuthenticated ? (
            <>
              <Link className="nav-link-btn" to="/pedidos">
                Mis pedidos
              </Link>
              {isAdmin ? (
                <Link className="nav-link-btn" to="/admin">
                  Admin
                </Link>
              ) : null}
              <span className="nav-user" title={user?.email}>
                {user?.name ?? user?.email?.split('@')[0]}
              </span>
              <button className="nav-link-btn nav-logout" type="button" onClick={handleLogout}>
                Salir
              </button>
            </>
          ) : (
            <>
              <Link className="auth-link" to="/login">
                Ingresar
              </Link>
              <Link className="register-link" to="/registro">
                Registrarse
              </Link>
            </>
          )}
          <Link className="cart-link" to="/carrito" aria-label="Ver carrito">
            <ShoppingBagIcon />
            {itemCount > 0 ? (
              <span>{itemCount > 9 ? '9+' : itemCount}</span>
            ) : null}
          </Link>
          <button
            className="mobile-toggle"
            type="button"
            onClick={() => setMobileOpen((current) => !current)}
            aria-label="Abrir menu"
          >
            {mobileOpen ? 'Cerrar' : 'Menu'}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <nav className="mobile-menu" aria-label="Navegacion movil">
          <NavLink to="/" onClick={closeMobileMenu}>
            Inicio
          </NavLink>
          <NavLink to="/catalogo" onClick={closeMobileMenu}>
            Catalogo
          </NavLink>
          {displayCategories.map((category) => (
            <Link
              key={category.idCategory}
              to={`/catalogo?categoria=${category.idCategory}`}
              onClick={closeMobileMenu}
            >
              {category.categoryName}
            </Link>
          ))}
          <NavLink to="/contacto" onClick={closeMobileMenu}>
            Contacto
          </NavLink>
          <NavLink to="/carrito" onClick={closeMobileMenu}>
            Carrito {itemCount > 0 ? `(${itemCount})` : ''}
          </NavLink>
          <div className="mobile-auth">
            {isAuthenticated ? (
              <button type="button" onClick={handleLogout}>
                Salir
              </button>
            ) : (
              <>
                <Link to="/login" onClick={closeMobileMenu}>
                  Ingresar
                </Link>
                <Link to="/registro" onClick={closeMobileMenu}>
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </nav>
      ) : null}
    </header>
  )
}

export default Navbar
