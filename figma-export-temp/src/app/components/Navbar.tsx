import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { ShoppingBag, Menu, X, User, LogOut, Package, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { MOCK_CATEGORIES } from '../services/api';

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex flex-col leading-none group">
            <span
              className="text-primary tracking-widest uppercase text-xs font-lato"
              style={{ fontFamily: 'Lato, sans-serif', letterSpacing: '0.25em' }}
            >
              alma
            </span>
            <span
              className="text-foreground"
              style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.6rem', lineHeight: 1 }}
            >
              Boho
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={`text-sm tracking-wider uppercase transition-colors hover:text-primary ${isActive('/') ? 'text-primary' : 'text-muted-foreground'}`}
              style={{ fontFamily: 'Lato, sans-serif', letterSpacing: '0.15em' }}
            >
              Inicio
            </Link>
            <Link
              to="/catalogo"
              className={`text-sm tracking-wider uppercase transition-colors hover:text-primary ${isActive('/catalogo') ? 'text-primary' : 'text-muted-foreground'}`}
              style={{ fontFamily: 'Lato, sans-serif', letterSpacing: '0.15em' }}
            >
              Catálogo
            </Link>
            {/* Categories dropdown */}
            <div className="relative group">
              <button
                className="flex items-center gap-1 text-sm tracking-wider uppercase text-muted-foreground hover:text-primary transition-colors"
                style={{ fontFamily: 'Lato, sans-serif', letterSpacing: '0.15em' }}
              >
                Colecciones
                <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200" />
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-52 bg-card border border-border rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
                {MOCK_CATEGORIES.map(cat => (
                  <Link
                    key={cat.idCategory}
                    to={`/catalogo?categoria=${cat.idCategory}`}
                    className="block px-4 py-2.5 text-sm text-foreground hover:text-primary hover:bg-muted transition-colors"
                    style={{ fontFamily: 'Lato, sans-serif' }}
                  >
                    {cat.categoryName}
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <Link
              to="/carrito"
              className="relative p-2 text-foreground hover:text-primary transition-colors"
              aria-label="Carrito"
            >
              <ShoppingBag size={22} />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-bold">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            {/* Auth */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="hidden md:flex items-center gap-2 p-2 text-foreground hover:text-primary transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <User size={16} className="text-foreground" />
                  </div>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-card border border-border rounded-xl shadow-xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-xs text-muted-foreground truncate" style={{ fontFamily: 'Lato, sans-serif' }}>
                        {user?.email}
                      </p>
                    </div>
                    <Link
                      to="/pedidos"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:text-primary hover:bg-muted transition-colors"
                      style={{ fontFamily: 'Lato, sans-serif' }}
                    >
                      <Package size={15} />
                      Mis Pedidos
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:text-primary hover:bg-muted transition-colors"
                      style={{ fontFamily: 'Lato, sans-serif' }}
                    >
                      <LogOut size={15} />
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm text-foreground hover:text-primary transition-colors px-3 py-1.5"
                  style={{ fontFamily: 'Lato, sans-serif', letterSpacing: '0.05em' }}
                >
                  Ingresar
                </Link>
                <Link
                  to="/registro"
                  className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-full hover:bg-primary/90 transition-colors"
                  style={{ fontFamily: 'Lato, sans-serif', letterSpacing: '0.05em' }}
                >
                  Registrarse
                </Link>
              </div>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
              aria-label="Menú"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card">
          <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="py-3 text-sm tracking-wider uppercase text-foreground hover:text-primary transition-colors border-b border-border"
              style={{ fontFamily: 'Lato, sans-serif', letterSpacing: '0.15em' }}
            >
              Inicio
            </Link>
            <Link
              to="/catalogo"
              onClick={() => setMobileOpen(false)}
              className="py-3 text-sm tracking-wider uppercase text-foreground hover:text-primary transition-colors border-b border-border"
              style={{ fontFamily: 'Lato, sans-serif', letterSpacing: '0.15em' }}
            >
              Catálogo
            </Link>
            {MOCK_CATEGORIES.map(cat => (
              <Link
                key={cat.idCategory}
                to={`/catalogo?categoria=${cat.idCategory}`}
                onClick={() => setMobileOpen(false)}
                className="py-2.5 pl-4 text-sm text-muted-foreground hover:text-primary transition-colors border-b border-border"
                style={{ fontFamily: 'Lato, sans-serif' }}
              >
                {cat.categoryName}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link
                  to="/pedidos"
                  onClick={() => setMobileOpen(false)}
                  className="py-3 text-sm tracking-wider uppercase text-foreground hover:text-primary transition-colors border-b border-border"
                  style={{ fontFamily: 'Lato, sans-serif', letterSpacing: '0.15em' }}
                >
                  Mis Pedidos
                </Link>
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="py-3 text-left text-sm tracking-wider uppercase text-foreground hover:text-primary transition-colors"
                  style={{ fontFamily: 'Lato, sans-serif', letterSpacing: '0.15em' }}
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <div className="flex gap-3 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center py-2.5 border border-primary text-primary rounded-full text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                  style={{ fontFamily: 'Lato, sans-serif' }}
                >
                  Ingresar
                </Link>
                <Link
                  to="/registro"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center py-2.5 bg-primary text-primary-foreground rounded-full text-sm hover:bg-primary/90 transition-colors"
                  style={{ fontFamily: 'Lato, sans-serif' }}
                >
                  Registrarse
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
