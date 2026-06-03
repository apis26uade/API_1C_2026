import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Trash2, Plus, Minus, Tag, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getDiscountByCode } from '../services/api';
import type { Discount } from '../types';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { toast } from 'sonner';

export function CartPage() {
  const { items, removeItem, updateQty, subtotal, discountAmount, total, discount, applyDiscount } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [checkingCode, setCheckingCode] = useState(false);

  const handleApplyCode = async () => {
    if (!code.trim()) return;
    setCheckingCode(true);
    try {
      const d: Discount = await getDiscountByCode(code.trim().toUpperCase());
      if (!d) throw new Error('Código no válido');
      if (!d.active) throw new Error('Este código ya no está activo');
      const now = new Date();
      if (new Date(d.validTo) < now) throw new Error('Este código ha expirado');
      applyDiscount(d);
      toast.success(`Descuento del ${d.percentage}% aplicado`, { description: `Código: ${d.code}` });
    } catch (e: any) {
      toast.error(e.message || 'Código no válido');
      applyDiscount(null);
    } finally {
      setCheckingCode(false);
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.info('Iniciá sesión para continuar con la compra');
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
          <ShoppingBag size={32} className="text-muted-foreground" />
        </div>
        <h2 className="text-foreground mb-3" style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem' }}>
          Tu carrito está vacío
        </h2>
        <p className="text-muted-foreground mb-8" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 300 }}>
          Explorá nuestra colección y encontrá algo que te encante
        </p>
        <Link
          to="/catalogo"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full text-sm hover:bg-primary/90 transition-colors"
          style={{ fontFamily: 'Lato, sans-serif', letterSpacing: '0.05em' }}
        >
          Ir al catálogo <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-16">
      <h1 className="text-foreground mb-8" style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)' }}>
        Tu carrito ({items.reduce((s, i) => s + i.quantity, 0)} {items.reduce((s, i) => s + i.quantity, 0) === 1 ? 'artículo' : 'artículos'})
      </h1>

      <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
        {/* Items */}
        <div className="flex flex-col gap-4">
          {items.map(item => (
            <div
              key={item.product.idProduct}
              className="bg-card border border-border rounded-2xl p-4 flex gap-4"
            >
              <Link to={`/producto/${item.product.idProduct}`} className="shrink-0">
                <div className="w-24 h-32 rounded-xl overflow-hidden bg-muted">
                  <ImageWithFallback
                    src={item.product.imageProduct}
                    alt={item.product.productName}
                    className="w-full h-full object-cover"
                  />
                </div>
              </Link>
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <p
                    className="text-xs text-primary tracking-widest uppercase mb-1"
                    style={{ fontFamily: 'Lato, sans-serif', letterSpacing: '0.15em' }}
                  >
                    {item.product.category.categoryName}
                  </p>
                  <Link to={`/producto/${item.product.idProduct}`}>
                    <h3
                      className="text-foreground hover:text-primary transition-colors leading-tight"
                      style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem' }}
                    >
                      {item.product.productName}
                    </h3>
                  </Link>
                  <p className="text-muted-foreground text-sm mt-1" style={{ fontFamily: 'Lato, sans-serif' }}>
                    ${item.product.price.toFixed(2)} c/u
                  </p>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-border rounded-full">
                    <button
                      onClick={() => updateQty(item.product.idProduct, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-foreground hover:text-primary transition-colors"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-8 text-center text-sm" style={{ fontFamily: 'Lato, sans-serif' }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQty(item.product.idProduct, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                      className="w-8 h-8 flex items-center justify-center text-foreground hover:text-primary transition-colors disabled:opacity-40"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-foreground" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 700 }}>
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeItem(item.product.idProduct)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-5 sticky top-24">
          <h2 className="text-foreground" style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem' }}>
            Resumen del pedido
          </h2>

          {/* Discount code */}
          <div>
            <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2" style={{ fontFamily: 'Lato, sans-serif' }}>
              <Tag size={13} /> Código de descuento
            </p>
            {discount ? (
              <div className="flex items-center justify-between bg-accent/10 border border-accent/30 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm text-accent" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 700 }}>{discount.code}</p>
                  <p className="text-xs text-muted-foreground" style={{ fontFamily: 'Lato, sans-serif' }}>{discount.percentage}% de descuento</p>
                </div>
                <button
                  onClick={() => { applyDiscount(null); setCode(''); }}
                  className="text-muted-foreground hover:text-destructive transition-colors text-xs"
                  style={{ fontFamily: 'Lato, sans-serif' }}
                >
                  Quitar
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && handleApplyCode()}
                  placeholder="BOHO10"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-input-background border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary"
                  style={{ fontFamily: 'Lato, sans-serif' }}
                />
                <button
                  onClick={handleApplyCode}
                  disabled={checkingCode || !code}
                  className="px-4 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm hover:bg-secondary/70 transition-colors disabled:opacity-50"
                  style={{ fontFamily: 'Lato, sans-serif' }}
                >
                  {checkingCode ? '...' : 'Aplicar'}
                </button>
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="flex flex-col gap-3 border-t border-border pt-4">
            <div className="flex justify-between text-sm" style={{ fontFamily: 'Lato, sans-serif' }}>
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">${subtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm" style={{ fontFamily: 'Lato, sans-serif' }}>
                <span className="text-accent">Descuento ({discount?.percentage}%)</span>
                <span className="text-accent">-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm" style={{ fontFamily: 'Lato, sans-serif' }}>
              <span className="text-muted-foreground">Envío</span>
              <span className="text-accent">{subtotal >= 150 ? 'Gratis' : '$12.00'}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-3" style={{ fontFamily: 'Lato, sans-serif' }}>
              <span className="text-foreground" style={{ fontWeight: 700 }}>Total</span>
              <span className="text-foreground" style={{ fontWeight: 700, fontSize: '1.2rem' }}>
                ${(total + (subtotal >= 150 ? 0 : 12)).toFixed(2)}
              </span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 rounded-full text-sm hover:bg-primary/90 transition-colors"
            style={{ fontFamily: 'Lato, sans-serif', letterSpacing: '0.05em' }}
          >
            Finalizar compra <ArrowRight size={16} />
          </button>

          <p className="text-xs text-center text-muted-foreground" style={{ fontFamily: 'Lato, sans-serif' }}>
            Pago 100% seguro · Devoluciones en 30 días
          </p>
        </div>
      </div>
    </div>
  );
}
