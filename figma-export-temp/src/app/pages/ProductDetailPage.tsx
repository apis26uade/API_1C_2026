import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { ShoppingBag, ArrowLeft, Minus, Plus, Check, Leaf } from 'lucide-react';
import { getProduct, getProducts } from '../services/api';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { ProductCard } from '../components/ProductCard';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { toast } from 'sonner';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setQty(1);
    setAdded(false);
    Promise.all([getProduct(Number(id)), getProducts()])
      .then(([prod, all]) => {
        setProduct(prod);
        setRelated(all.filter(p => p.idProduct !== prod.idProduct && p.category.idCategory === prod.category.idCategory).slice(0, 4));
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdd = () => {
    if (!product) return;
    addItem(product, qty);
    setAdded(true);
    toast.success(`"${product.productName}" agregado al carrito`, { duration: 2500 });
    setTimeout(() => setAdded(false), 2500);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="aspect-[3/4] bg-muted rounded-3xl animate-pulse" />
          <div className="space-y-4 pt-4">
            <div className="h-3 bg-muted rounded w-1/4 animate-pulse" />
            <div className="h-8 bg-muted rounded w-3/4 animate-pulse" />
            <div className="h-6 bg-muted rounded w-1/4 animate-pulse" />
            <div className="h-20 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 text-center">
        <p className="text-muted-foreground" style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem' }}>
          Producto no encontrado
        </p>
        <Link to="/catalogo" className="mt-6 inline-block text-primary text-sm underline" style={{ fontFamily: 'Lato, sans-serif' }}>
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const stockStatus = product.stock === 0
    ? { label: 'Sin stock', color: 'text-destructive' }
    : product.stock <= 5
    ? { label: `¡Solo quedan ${product.stock}!`, color: 'text-primary' }
    : { label: `En stock (${product.stock} disponibles)`, color: 'text-accent' };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8 text-sm text-muted-foreground" style={{ fontFamily: 'Lato, sans-serif' }}>
        <Link to="/" className="hover:text-primary transition-colors">Inicio</Link>
        <span>/</span>
        <Link to="/catalogo" className="hover:text-primary transition-colors">Catálogo</Link>
        <span>/</span>
        <Link to={`/catalogo?categoria=${product.category.idCategory}`} className="hover:text-primary transition-colors">
          {product.category.categoryName}
        </Link>
        <span>/</span>
        <span className="text-foreground truncate">{product.productName}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
        {/* Image */}
        <div className="relative">
          <div className="aspect-[3/4] overflow-hidden rounded-3xl bg-muted">
            <ImageWithFallback
              src={product.imageProduct}
              alt={product.productName}
              className="w-full h-full object-cover"
            />
          </div>
          {product.stock > 0 && product.stock <= 5 && (
            <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs" style={{ fontFamily: 'Lato, sans-serif' }}>
              ¡Últimas unidades!
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-6">
          <div>
            <Link
              to={`/catalogo?categoria=${product.category.idCategory}`}
              className="text-xs text-primary tracking-widest uppercase hover:underline"
              style={{ fontFamily: 'Lato, sans-serif', letterSpacing: '0.2em' }}
            >
              {product.category.categoryName}
            </Link>
            <h1
              className="text-foreground mt-2 mb-4 leading-tight"
              style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)' }}
            >
              {product.productName}
            </h1>
            <p
              className="text-foreground"
              style={{ fontFamily: 'Lato, sans-serif', fontSize: '1.8rem', fontWeight: 300 }}
            >
              ${product.price.toFixed(2)}
            </p>
          </div>

          {/* Stock */}
          <p className={`text-sm flex items-center gap-2 ${stockStatus.color}`} style={{ fontFamily: 'Lato, sans-serif' }}>
            <Check size={14} />
            {stockStatus.label}
          </p>

          {/* Description */}
          <p
            className="text-muted-foreground leading-relaxed border-t border-border pt-6"
            style={{ fontFamily: 'Lato, sans-serif', fontWeight: 300, lineHeight: 1.8 }}
          >
            {product.productDescription}
          </p>

          {/* Quantity */}
          {product.stock > 0 && (
            <div className="flex items-center gap-4">
              <p className="text-sm text-foreground" style={{ fontFamily: 'Lato, sans-serif' }}>Cantidad:</p>
              <div className="flex items-center border border-border rounded-full">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-foreground hover:text-primary transition-colors"
                  disabled={qty <= 1}
                >
                  <Minus size={15} />
                </button>
                <span className="w-10 text-center text-sm" style={{ fontFamily: 'Lato, sans-serif' }}>{qty}</span>
                <button
                  onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                  className="w-10 h-10 flex items-center justify-center text-foreground hover:text-primary transition-colors"
                  disabled={qty >= product.stock}
                >
                  <Plus size={15} />
                </button>
              </div>
            </div>
          )}

          {/* Add to Cart */}
          <button
            onClick={handleAdd}
            disabled={product.stock === 0}
            className={`flex items-center justify-center gap-3 w-full py-4 rounded-full text-sm transition-all ${
              added
                ? 'bg-accent text-accent-foreground'
                : product.stock === 0
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
            style={{ fontFamily: 'Lato, sans-serif', letterSpacing: '0.05em' }}
          >
            {added ? <Check size={18} /> : <ShoppingBag size={18} />}
            {added ? '¡Agregado!' : product.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
          </button>

          {/* Features */}
          <div className="grid grid-cols-1 gap-3 border-t border-border pt-6">
            {[
              { icon: Leaf, text: 'Materiales naturales y sostenibles' },
              { icon: Check, text: 'Envío gratis en compras mayores a $150' },
              { icon: ArrowLeft, text: 'Cambios y devoluciones en 30 días' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-muted-foreground" style={{ fontFamily: 'Lato, sans-serif' }}>
                <Icon size={14} className="text-primary shrink-0" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-20">
          <h2
            className="text-foreground mb-8 text-center"
            style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}
          >
            También te puede gustar
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {related.map(p => <ProductCard key={p.idProduct} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
