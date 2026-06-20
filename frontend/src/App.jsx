import { Navigate, Route, Routes } from 'react-router-dom'
import AdminRoute from './components/AdminRoute.jsx'
import Footer from './components/Footer.jsx'
import Navbar from './components/Navbar.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AdminLayout from './components/admin/AdminLayout.jsx'
import Cart from './pages/Cart.jsx'
import Checkout from './pages/Checkout.jsx'
import Contact from './pages/Contact.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import NotFound from './pages/NotFound.jsx'
import OrderDetail from './pages/OrderDetail.jsx'
import Orders from './pages/Orders.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import Products from './pages/Products.jsx'
import Register from './pages/Register.jsx'
import AdminCategories from './pages/admin/AdminCategories.jsx'
import AdminOrders from './pages/admin/AdminOrders.jsx'
import AdminProducts from './pages/admin/AdminProducts.jsx'

function StoreLayout({ children }) {
  return (
    <div className="app-shell">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Navigate to="productos" replace />} />
        <Route path="productos" element={<AdminProducts />} />
        <Route path="categorias" element={<AdminCategories />} />
        <Route path="pedidos" element={<AdminOrders />} />
      </Route>

      <Route
        path="/checkout"
        element={
          <StoreLayout>
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          </StoreLayout>
        }
      />
      <Route
        path="/pedidos/:id"
        element={
          <StoreLayout>
            <ProtectedRoute>
              <OrderDetail />
            </ProtectedRoute>
          </StoreLayout>
        }
      />
      <Route
        path="/pedidos"
        element={
          <StoreLayout>
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          </StoreLayout>
        }
      />

      <Route
        path="/"
        element={
          <StoreLayout>
            <Home />
          </StoreLayout>
        }
      />
      <Route
        path="/productos"
        element={
          <StoreLayout>
            <Products />
          </StoreLayout>
        }
      />
      <Route
        path="/catalogo"
        element={
          <StoreLayout>
            <Products />
          </StoreLayout>
        }
      />
      <Route
        path="/detalle/:id"
        element={
          <StoreLayout>
            <ProductDetail />
          </StoreLayout>
        }
      />
      <Route
        path="/producto/:id"
        element={
          <StoreLayout>
            <ProductDetail />
          </StoreLayout>
        }
      />
      <Route
        path="/carrito"
        element={
          <StoreLayout>
            <Cart />
          </StoreLayout>
        }
      />
      <Route
        path="/contacto"
        element={
          <StoreLayout>
            <Contact />
          </StoreLayout>
        }
      />
      <Route
        path="/login"
        element={
          <StoreLayout>
            <Login />
          </StoreLayout>
        }
      />
      <Route
        path="/registro"
        element={
          <StoreLayout>
            <Register />
          </StoreLayout>
        }
      />
      <Route
        path="*"
        element={
          <StoreLayout>
            <NotFound />
          </StoreLayout>
        }
      />
    </Routes>
  )
}

export default App
