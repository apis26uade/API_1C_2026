import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { OrdersPage } from './pages/OrdersPage';
import { OrderDetailPage } from './pages/OrderDetailPage';

function ProtectedCheckout() {
  return (
    <ProtectedRoute>
      <CheckoutPage />
    </ProtectedRoute>
  );
}

function ProtectedOrders() {
  return (
    <ProtectedRoute>
      <OrdersPage />
    </ProtectedRoute>
  );
}

function ProtectedOrderDetail() {
  return (
    <ProtectedRoute>
      <OrderDetailPage />
    </ProtectedRoute>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: 'catalogo', Component: CatalogPage },
      { path: 'producto/:id', Component: ProductDetailPage },
      { path: 'carrito', Component: CartPage },
      { path: 'checkout', Component: ProtectedCheckout },
      { path: 'login', Component: LoginPage },
      { path: 'registro', Component: RegisterPage },
      { path: 'pedidos', Component: ProtectedOrders },
      { path: 'pedidos/:id', Component: ProtectedOrderDetail },
    ],
  },
]);
