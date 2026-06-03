import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Leaf, Recycle, Heart } from 'lucide-react';
import { getProducts, getCategories, MOCK_CATEGORIES } from '../services/api';
import type { Product, Category } from '../types';
import { ProductCard } from '../components/ProductCard';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

const CATEGORY_IMAGES: Record<number, string> = {
  1: 'https://images.unsplash.com/photo-1759992878336-a5dd342ea245?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500&q=80',
  2: 'https://images.unsplash.com/photo-1585439623131-6a91ce98e4c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500&q=80',
  3: 'https://images.unsplash.com/photo-1768033976461-61ea7527ac1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500&q=80',
  4: 'https://images.unsplash.com/photo-1766560360636-69204af3c947?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500&q=80',
  5: 'https://images.unsplash.com/photo-1773335954232-957e8945827e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500&q=80',
};

export function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProducts(), getCategories()])
      .then(([prods, cats]) => {
        setProducts(prods);
        setCategories(cats);
      })
      .finally(() => setLoading(false));
  }, []);

  const featured = products.slice(0, 4);

  return (
    <div className="w-full">
      {/* ── Hero ── */}
      <section className="relative h-[90vh] min-h-[560px] overflow-hidden">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1768033976461-61ea7527ac1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1400&q=85"
          alt="Alma Boho Hero"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/40 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="max-w-lg">
              <p
                className="text-primary tracking-widest uppercase text-sm mb-4"
                style={{ fontFamily: 'Lato, sans-serif', letterSpacing: '0.3em' }}
              >
                Nueva Colección 2026
              </p>
              <h1
                className="text-background leading-tight mb-6"
                style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: 1.1 }}
              >
                Moda que respira libertad
              </h1>
              <p
                className="text-background/80 mb-8 leading-relaxed"
                style={{ fontFamily: 'Lato, sans-serif', fontSize: '1.1rem', fontWeight: 300 }}
              >
                Prendas artesanales con alma, diseñadas para la mujer que abraza su esencia natural y libre.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/catalogo"
                  className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full text-sm hover:bg-primary/90 transition-all hover:gap-3"
                  style={{ fontFamily: 'Lato, sans-serif', letterSpacing: '0.1em' }}
                >
                  Ver Colección
                  <ArrowRight size={16} />
                </Link>
                <Link
                  to="/catalogo?categoria=1"
                  className="inline-flex items-center justify-center gap-2 border border-background/60 text-background px-8 py-4 rounded-full text-sm hover:bg-background/10 transition-colors"
                  style={{ fontFamily: 'Lato, sans-serif', letterSpacing: '0.1em' }}
                >
                  Vestidos
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values strip ── */}
      <section className="bg-secondary/40 border-y border-border">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              { icon: Leaf, label: 'Materiales Naturales', sub: 'Lino, algodón y fibras orgánicas' },
              { icon: Recycle, label: 'Producción Sostenible', sub: 'Packaging 100% reciclado' },
              { icon: Heart, label: 'Artesanía Local', sub: 'Apoyamos comunidades artesanas' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex flex-col sm:flex-row items-center gap-3 justify-center">
                <Icon size={20} className="text-primary shrink-0" />
                <div className="text-left text-center sm:text-left">
                  <p className="text-foreground text-sm" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 700 }}>{label}</p>
                  <p className="text-muted-foreground text-xs" style={{ fontFamily: 'Lato, sans-serif' }}>{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="text-center mb-12">
          <p className="text-primary tracking-widest uppercase text-xs mb-3" style={{ fontFamily: 'Lato, sans-serif', letterSpacing: '0.3em' }}>
            Explorar por estilo
          </p>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>
            Nuestras Colecciones
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {(categories.length ? categories : MOCK_CATEGORIES).map(cat => (
            <Link
              key={cat.idCategory}
              to={`/catalogo?categoria=${cat.idCategory}`}
              className="group relative overflow-hidden rounded-2xl aspect-[3/4]"
            >
              <ImageWithFallback
                src={CATEGORY_IMAGES[cat.idCategory] || CATEGORY_IMAGES[1]}
                alt={cat.categoryName}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent group-hover:from-primary/70 transition-all duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p
                  className="text-background text-center"
                  style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.05rem' }}
                >
                  {cat.categoryName}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-primary tracking-widest uppercase text-xs mb-3" style={{ fontFamily: 'Lato, sans-serif', letterSpacing: '0.3em' }}>
                Lo más nuevo
              </p>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>
                Nuevas Llegadas
              </h2>
            </div>
            <Link
              to="/catalogo"
              className="hidden sm:flex items-center gap-2 text-sm text-primary hover:gap-3 transition-all"
              style={{ fontFamily: 'Lato, sans-serif', letterSpacing: '0.05em' }}
            >
              Ver todo <ArrowRight size={15} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-muted rounded-2xl mb-3" />
                  <div className="h-3 bg-muted rounded w-1/2 mb-2" />
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {featured.map(product => (
                <ProductCard key={product.idProduct} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-10 sm:hidden">
            <Link
              to="/catalogo"
              className="inline-flex items-center gap-2 text-sm text-primary"
              style={{ fontFamily: 'Lato, sans-serif' }}
            >
              Ver todo el catálogo <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Banner ── */}
      <section className="relative overflow-hidden">
        <div className="grid md:grid-cols-2 min-h-[480px]">
          <div className="relative">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1549412522-c8a0a5211846?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80"
              alt="El alma de Boho"
              className="w-full h-full object-cover min-h-[320px]"
            />
          </div>
          <div className="bg-secondary flex items-center px-8 md:px-14 py-14">
            <div>
              <p className="text-primary tracking-widest uppercase text-xs mb-4" style={{ fontFamily: 'Lato, sans-serif', letterSpacing: '0.3em' }}>
                Nuestra Filosofía
              </p>
              <h2 className="text-foreground mb-6 leading-tight" style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)' }}>
                Cada prenda<br />cuenta una historia
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 300, fontSize: '1rem' }}>
                Trabajamos con artesanas locales para crear prendas únicas que reflejan la riqueza cultural de nuestras raíces. Cada bordado, cada puntada, es un acto de amor y tradición.
              </p>
              <Link
                to="/catalogo"
                className="inline-flex items-center gap-2 border-b border-primary text-primary pb-0.5 text-sm hover:gap-3 transition-all"
                style={{ fontFamily: 'Lato, sans-serif', letterSpacing: '0.1em' }}
              >
                Descubrir más <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Full catalog strip ── */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-primary tracking-widest uppercase text-xs mb-3" style={{ fontFamily: 'Lato, sans-serif', letterSpacing: '0.3em' }}>
                Para vos
              </p>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>
                Colección completa
              </h2>
            </div>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-muted rounded-2xl mb-3" />
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {products.slice(4, 8).map(product => (
                <ProductCard key={product.idProduct} product={product} />
              ))}
            </div>
          )}
          <div className="text-center mt-12">
            <Link
              to="/catalogo"
              className="inline-flex items-center gap-2 bg-foreground text-background px-10 py-4 rounded-full text-sm hover:bg-primary transition-colors"
              style={{ fontFamily: 'Lato, sans-serif', letterSpacing: '0.1em' }}
            >
              Ver catálogo completo
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section className="bg-secondary/50 border-y border-border py-16">
        <div className="max-w-xl mx-auto px-6 text-center">
          <p className="text-primary tracking-widest uppercase text-xs mb-4" style={{ fontFamily: 'Lato, sans-serif', letterSpacing: '0.3em' }}>
            Comunidad Boho
          </p>
          <h2 className="text-foreground mb-4" style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>
            Sé la primera en enterarte
          </h2>
          <p className="text-muted-foreground mb-8 text-sm" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 300 }}>
            Nuevas colecciones, descuentos exclusivos y tips de estilo directamente en tu bandeja.
          </p>
          <form
            onSubmit={e => { e.preventDefault(); alert('¡Gracias por suscribirte! 🌿'); }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <input
              type="email"
              required
              placeholder="tu@email.com"
              className="flex-1 px-4 py-3 rounded-full bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm"
              style={{ fontFamily: 'Lato, sans-serif' }}
            />
            <button
              type="submit"
              className="bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm hover:bg-primary/90 transition-colors whitespace-nowrap"
              style={{ fontFamily: 'Lato, sans-serif', letterSpacing: '0.05em' }}
            >
              Suscribirme
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
