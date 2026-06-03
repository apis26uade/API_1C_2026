import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Check, Package, CreditCard, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/api';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { toast } from 'sonner';

interface FormData {
  name: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  zip: string;
  notes: string;
}

export function CheckoutPage() {
  const { items, subtotal, discountAmount, total, discount, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<'shipping' | 'payment' | 'success'>('shipping');
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>({
    name: user?.email?.split('@')[0] || '',
    phone: '', address: '', city: '', province: '', zip: '', notes: '',
  });

  const shipping = subtotal >= 150 ? 0 : 12;
  const grandTotal = total + shipping;

  const update = (k: keyof FormData, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleOrder = async () => {
    setLoading(true);
    try {
      const order = await createOrder(user?.idUser || 1, grandTotal, discount?.idDiscount);
      setOrderId(order.idOrder);
      clearCart();
      setStep('success');
      toast.success('¡Pedido confirmado!');
    } catch {
      toast.error('Hubo un problema al procesar el pedido. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
          <Check size={36} className="text-accent" />
        </div>
        <h1 className="text-foreground mb-3" style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem' }}>
          ¡Gracias por tu compra!
        </h1>
        <p className="text-muted-foreground mb-2" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 300 }}>
          Tu pedido #{orderId || 'DEMO'} fue confirmado.
        </p>
        <p className="text-muted-foreground mb-8 text-sm" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 300 }}>
          Te enviaremos un email con los detalles del envío en las próximas horas.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/pedidos"
            className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-full text-sm hover:bg-primary/90 transition-colors"
            style={{ fontFamily: 'Lato, sans-serif' }}
          >
            <Package size={15} />
            Ver mis pedidos
          </Link>
          <Link
            to="/catalogo"
            className="inline-flex items-center justify-center px-8 py-3 border border-border rounded-full text-sm text-foreground hover:border-primary hover:text-primary transition-colors"
            style={{ fontFamily: 'Lato, sans-serif' }}
          >
            Seguir comprando
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-16">
      <h1 className="text-foreground mb-8" style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)' }}>
        Finalizar compra
      </h1>

      {/* Steps */}
      <div className="flex items-center gap-3 mb-10">
        {(['shipping', 'payment'] as const).map((s, i) => {
          const labels = ['Envío', 'Pago'];
          const icons = [MapPin, CreditCard];
          const Icon = icons[i];
          const active = step === s;
          const done = (s === 'shipping' && step === 'payment');
          return (
            <div key={s} className="flex items-center gap-2">
              {i > 0 && <div className="w-12 h-px bg-border" />}
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm ${active ? 'bg-primary text-primary-foreground' : done ? 'bg-accent/20 text-accent' : 'bg-muted text-muted-foreground'}`} style={{ fontFamily: 'Lato, sans-serif' }}>
                {done ? <Check size={13} /> : <Icon size={13} />}
                {labels[i]}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
        {/* Form */}
        <div className="bg-card border border-border rounded-2xl p-6">
          {step === 'shipping' && (
            <div className="flex flex-col gap-5">
              <h2 className="text-foreground" style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem' }}>
                Datos de envío
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Nombre completo" value={form.name} onChange={v => update('name', v)} />
                <Field label="Teléfono" type="tel" value={form.phone} onChange={v => update('phone', v)} />
              </div>
              <Field label="Dirección" value={form.address} onChange={v => update('address', v)} placeholder="Calle y número" />
              <div className="grid sm:grid-cols-3 gap-4">
                <Field label="Ciudad" value={form.city} onChange={v => update('city', v)} />
                <Field label="Provincia" value={form.province} onChange={v => update('province', v)} />
                <Field label="Código postal" value={form.zip} onChange={v => update('zip', v)} />
              </div>
              <div>
                <label className="block text-sm text-foreground mb-1.5" style={{ fontFamily: 'Lato, sans-serif' }}>
                  Notas (opcional)
                </label>
                <textarea
                  value={form.notes}
                  onChange={e => update('notes', e.target.value)}
                  rows={3}
                  placeholder="Instrucciones especiales de entrega..."
                  className="w-full px-4 py-3 rounded-xl bg-input-background border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary resize-none"
                  style={{ fontFamily: 'Lato, sans-serif' }}
                />
              </div>
              <button
                onClick={() => setStep('payment')}
                disabled={!form.name || !form.address || !form.city}
                className="w-full py-4 bg-primary text-primary-foreground rounded-full text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: 'Lato, sans-serif', letterSpacing: '0.05em' }}
              >
                Continuar al pago
              </button>
            </div>
          )}

          {step === 'payment' && (
            <div className="flex flex-col gap-5">
              <h2 className="text-foreground" style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem' }}>
                Método de pago
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {['Tarjeta de crédito', 'Débito', 'Transferencia'].map(method => (
                  <div
                    key={method}
                    className="border-2 border-primary bg-primary/5 rounded-xl p-3 text-center cursor-pointer"
                  >
                    <CreditCard size={20} className="mx-auto mb-1 text-primary" />
                    <p className="text-xs text-foreground" style={{ fontFamily: 'Lato, sans-serif' }}>{method}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-4">
                <Field label="Número de tarjeta" value="4242 4242 4242 4242" onChange={() => {}} placeholder="1234 5678 9012 3456" />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Vencimiento" value="12/27" onChange={() => {}} placeholder="MM/AA" />
                  <Field label="CVV" value="123" onChange={() => {}} placeholder="123" />
                </div>
                <Field label="Nombre en la tarjeta" value={form.name} onChange={v => update('name', v)} />
              </div>

              <div className="bg-muted/50 rounded-xl p-4 text-sm text-muted-foreground flex items-start gap-2" style={{ fontFamily: 'Lato, sans-serif' }}>
                <Check size={15} className="text-accent shrink-0 mt-0.5" />
                Tus datos de pago están protegidos con cifrado SSL de 256 bits.
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('shipping')}
                  className="flex-1 py-4 border border-border rounded-full text-sm text-foreground hover:border-primary hover:text-primary transition-colors"
                  style={{ fontFamily: 'Lato, sans-serif' }}
                >
                  Volver
                </button>
                <button
                  onClick={handleOrder}
                  disabled={loading}
                  className="flex-2 flex-1 py-4 bg-primary text-primary-foreground rounded-full text-sm hover:bg-primary/90 transition-colors disabled:opacity-70"
                  style={{ fontFamily: 'Lato, sans-serif', letterSpacing: '0.05em' }}
                >
                  {loading ? 'Procesando...' : `Confirmar pedido · $${grandTotal.toFixed(2)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-card border border-border rounded-2xl p-6 sticky top-24">
          <h2 className="text-foreground mb-4" style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem' }}>
            Tu pedido
          </h2>
          <div className="flex flex-col gap-3 mb-4">
            {items.map(item => (
              <div key={item.product.idProduct} className="flex gap-3 items-center">
                <div className="w-14 h-18 rounded-lg overflow-hidden bg-muted shrink-0" style={{ height: '4.5rem' }}>
                  <ImageWithFallback
                    src={item.product.imageProduct}
                    alt={item.product.productName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 500 }}>
                    {item.product.productName}
                  </p>
                  <p className="text-xs text-muted-foreground" style={{ fontFamily: 'Lato, sans-serif' }}>
                    x{item.quantity}
                  </p>
                </div>
                <p className="text-sm text-foreground shrink-0" style={{ fontFamily: 'Lato, sans-serif' }}>
                  ${(item.product.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-4 flex flex-col gap-2">
            <div className="flex justify-between text-sm" style={{ fontFamily: 'Lato, sans-serif' }}>
              <span className="text-muted-foreground">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm text-accent" style={{ fontFamily: 'Lato, sans-serif' }}>
                <span>Descuento ({discount?.percentage}%)</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm" style={{ fontFamily: 'Lato, sans-serif' }}>
              <span className="text-muted-foreground">Envío</span>
              <span className={shipping === 0 ? 'text-accent' : ''}>{shipping === 0 ? 'Gratis' : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-3" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 700 }}>
              <span>Total</span>
              <span className="text-primary" style={{ fontSize: '1.1rem' }}>${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm text-foreground mb-1.5" style={{ fontFamily: 'Lato, sans-serif' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl bg-input-background border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary"
        style={{ fontFamily: 'Lato, sans-serif' }}
      />
    </div>
  );
}
