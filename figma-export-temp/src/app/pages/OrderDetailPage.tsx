import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, Package } from 'lucide-react';
import { getOrder, getOrderItems } from '../services/api';
import type { Order, OrderItem, OrderStatus } from '../types';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

const STATUS_MAP: Record<OrderStatus, { label: string; color: string; bg: string; step: number }> = {
  PENDING:    { label: 'Pendiente',  color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200',      step: 1 },
  PROCESSING: { label: 'Procesando', color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200',        step: 2 },
  SHIPPED:    { label: 'En camino',  color: 'text-indigo-700',  bg: 'bg-indigo-50 border-indigo-200',    step: 3 },
  DELIVERED:  { label: 'Entregado',  color: 'text-accent',      bg: 'bg-accent/10 border-accent/30',     step: 4 },
  CANCELLED:  { label: 'Cancelado',  color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/20', step: 0 },
};

const STEPS = ['Confirmado', 'Procesando', 'En camino', 'Entregado'];

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([getOrder(Number(id)), getOrderItems(Number(id))])
      .then(([o, its]) => { setOrder(o); setItems(its); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="h-6 bg-muted rounded w-1/4 mb-8 animate-pulse" />
        <div className="h-40 bg-muted rounded-2xl mb-4 animate-pulse" />
        <div className="h-40 bg-muted rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <p className="text-muted-foreground" style={{ fontFamily: 'Playfair Display, serif' }}>
          Pedido no encontrado
        </p>
        <Link to="/pedidos" className="mt-4 inline-block text-primary text-sm" style={{ fontFamily: 'Lato, sans-serif' }}>
          Volver a mis pedidos
        </Link>
      </div>
    );
  }

  const status = STATUS_MAP[order.status] || STATUS_MAP.PENDING;
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-16">
      <Link
        to="/pedidos"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
        style={{ fontFamily: 'Lato, sans-serif' }}
      >
        <ArrowLeft size={15} />
        Mis pedidos
      </Link>

      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>
            Pedido #{order.idOrder}
          </h1>
        </div>
        <span
          className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm border ${status.bg} ${status.color}`}
          style={{ fontFamily: 'Lato, sans-serif' }}
        >
          {status.label}
        </span>
      </div>

      {/* Status tracker */}
      {!isCancelled && (
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <div className="relative flex justify-between">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-muted" />
            <div
              className="absolute top-4 left-0 h-0.5 bg-primary transition-all duration-500"
              style={{ width: `${((status.step - 1) / 3) * 100}%` }}
            />
            {STEPS.map((label, i) => {
              const done = status.step > i + 1;
              const active = status.step === i + 1;
              return (
                <div key={label} className="relative flex flex-col items-center gap-2 z-10">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                    done || active ? 'bg-primary border-primary' : 'bg-card border-border'
                  }`}>
                    {done ? (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <div className={`w-2 h-2 rounded-full ${active ? 'bg-white' : 'bg-muted-foreground/40'}`} />
                    )}
                  </div>
                  <p
                    className={`text-xs text-center whitespace-nowrap ${active || done ? 'text-foreground' : 'text-muted-foreground'}`}
                    style={{ fontFamily: 'Lato, sans-serif', fontWeight: active ? 700 : 400 }}
                  >
                    {label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <h2 className="text-foreground mb-5" style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem' }}>
          Artículos
        </h2>
        {items.length === 0 ? (
          <div className="flex items-center gap-3 py-4 text-muted-foreground">
            <Package size={18} />
            <p className="text-sm" style={{ fontFamily: 'Lato, sans-serif' }}>
              Los detalles del pedido están siendo procesados
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {items.map((item, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="w-16 h-20 rounded-xl overflow-hidden bg-muted shrink-0">
                  <ImageWithFallback
                    src={item.product.imageProduct}
                    alt={item.product.productName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-primary uppercase tracking-widest mb-1" style={{ fontFamily: 'Lato, sans-serif', letterSpacing: '0.15em' }}>
                    {item.product.category.categoryName}
                  </p>
                  <p className="text-foreground" style={{ fontFamily: 'Playfair Display, serif', fontSize: '0.95rem' }}>
                    {item.product.productName}
                  </p>
                  <p className="text-muted-foreground text-sm mt-0.5" style={{ fontFamily: 'Lato, sans-serif' }}>
                    ${item.unitPrice.toFixed(2)} × {item.quantity}
                  </p>
                </div>
                <p className="text-foreground shrink-0" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 700 }}>
                  ${(item.unitPrice * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="text-foreground mb-4" style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem' }}>
          Resumen
        </h2>
        <div className="flex flex-col gap-2">
          {order.discount && (
            <div className="flex justify-between text-sm text-accent" style={{ fontFamily: 'Lato, sans-serif' }}>
              <span>Descuento aplicado</span>
              <span>{order.discount.code} (-{order.discount.percentage}%)</span>
            </div>
          )}
          <div className="flex justify-between border-t border-border pt-3" style={{ fontFamily: 'Lato, sans-serif' }}>
            <span className="text-foreground" style={{ fontWeight: 700 }}>Total pagado</span>
            <span className="text-primary" style={{ fontWeight: 700, fontSize: '1.2rem' }}>
              ${order.total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
