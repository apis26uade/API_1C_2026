import { Link } from 'react-router';
import { ShoppingBag, Heart } from 'lucide-react';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock === 0) return;
    addItem(product, 1);
    toast.success(`"${product.productName}" agregado al carrito`, {
      description: `$${product.price.toFixed(2)}`,
      duration: 2500,
    });
  };

  return (
    <Link to={`/producto/${product.idProduct}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl bg-muted aspect-[3/4]">
        <ImageWithFallback
          src={product.imageProduct}
          alt={product.productName}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Stock badge */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center">
            <span
              className="bg-card text-foreground px-4 py-1.5 rounded-full text-sm"
              style={{ fontFamily: 'Lato, sans-serif', letterSpacing: '0.1em' }}
            >
              Sin stock
            </span>
          </div>
        )}
        {product.stock > 0 && product.stock <= 5 && (
          <div className="absolute top-3 left-3">
            <span
              className="bg-primary text-primary-foreground px-2.5 py-1 rounded-full text-xs"
              style={{ fontFamily: 'Lato, sans-serif', letterSpacing: '0.05em' }}
            >
              ¡Últimas {product.stock}!
            </span>
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={e => e.preventDefault()}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-card hover:text-primary"
          aria-label="Guardar"
        >
          <Heart size={15} />
        </button>

        {/* Add to cart overlay */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-3">
          <button
            onClick={handleAdd}
            disabled={product.stock === 0}
            className="w-full flex items-center justify-center gap-2 bg-foreground text-background py-3 rounded-xl text-sm hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: 'Lato, sans-serif', letterSpacing: '0.05em' }}
          >
            <ShoppingBag size={15} />
            Agregar al carrito
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="mt-3 px-1">
        <p
          className="text-xs text-primary tracking-widest uppercase mb-1"
          style={{ fontFamily: 'Lato, sans-serif', letterSpacing: '0.15em' }}
        >
          {product.category.categoryName}
        </p>
        <h3
          className="text-foreground group-hover:text-primary transition-colors leading-tight mb-1"
          style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem' }}
        >
          {product.productName}
        </h3>
        <p className="text-foreground" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 300, fontSize: '0.95rem' }}>
          ${product.price.toFixed(2)}
        </p>
      </div>
    </Link>
  );
}
