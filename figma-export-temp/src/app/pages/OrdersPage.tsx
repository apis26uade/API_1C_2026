import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Package, ChevronRight, ShoppingBag } from 'lucide-react';
import { getUserOrders } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Order, OrderStatus } from '../types';

const STATUS_MAP: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  PENDING:    { label: 'Pendiente',   color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200' },
  PROCESSING: { label: 'Procesando',  color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200' },
  SHIPPED:    { label: 'En camino',   color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200' },
  DELIVERED:  { label: 'Entregado',   color: 'text-accent',     bg: 'bg-accent/10 border-accent/30' },
  CANCELLED:  { label: 'Cancelado',   color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/20' },
};

export function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.idUser) {
      // Use mock data with userId=1 as fallback
      getUserOrders(1).then(setOrders).finally(() => setLoading(false));
      return;
    }
    getUserOrders(user.idUser).then(setOrders).finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="h-8 bg-muted rounded w-1/3 mb-8 animate-pulse" />
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-muted rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-16">
      <div className="mb-10">
        <p className="text-primary tracking-widest uppercase text-xs mb-2" style={{ fontFamily: 'Lato, sans-serif', letterSpacing: '0.3em' }}>
          Historial
        </p>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)' }}>
          Mis pedidos
        </h1>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={32} className="text-muted-foreground" />
          </div>
          <h2 className="text-foreground mb-3" style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem' }}>
            Sin pedidos aún
          </h2>
          <p className="text-muted-foreground mb-8" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 300 }}>
            Cuando realices una compra, aparecerá aquí
          </p>
          <Link
            to="/catalogo"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-full text-sm hover:bg-primary/90 transition-colors"
            style={{ fontFamily: 'Lato, sans-serif' }}
          >
            Ir a comprar
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map(order => {
            const status = STATUS_MAP[order.status] || STATUS_MAP.PENDING;
            return (
              <Link
                key={order.idOrder}
                to={`/pedidos/${order.idOrder}`}
                className="block bg-card border border-border rounded-2xl p-5 hover:border-primary transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
                      <Package size={20} className="text-muted-foreground" />
                    </div>
                    <div>
                      <p
                        className="text-foreground"
                        style={{ fontFamily: 'Lato, sans-serif', fontWeight: 700 }}
                      >
                        Pedido #{order.idOrder}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${status.bg} ${status.color}`}
                          style={{ fontFamily: 'Lato, sans-serif' }}
                        >
                          {status.label}
                        </span>
                        {order.discount && (
                          <span className="text-xs text-accent" style={{ fontFamily: 'Lato, sans-serif' }}>
                            Descuento aplicado
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p
                        className="text-foreground"
                        style={{ fontFamily: 'Lato, sans-serif', fontWeight: 700, fontSize: '1.1rem' }}
                      >
                        ${order.total.toFixed(2)}
                      </p>
                    </div>
                    <ChevronRight size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
                <p
                  className="text-foreground mt-3 sm:hidden"
                  style={{ fontFamily: 'Lato, sans-serif', fontWeight: 700, fontSize: '1.1rem' }}
                >
                  ${order.total.toFixed(2)}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
