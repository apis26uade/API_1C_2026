import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { getProducts, getCategories } from '../services/api';
import type { Product, Category } from '../types';
import { ProductCard } from '../components/ProductCard';

const SORT_OPTIONS = [
  { value: 'default', label: 'Destacados' },
  { value: 'price-asc', label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a menor' },
  { value: 'name', label: 'Nombre A-Z' },
];

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const search = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('categoria') ? Number(searchParams.get('categoria')) : null;
  const sort = searchParams.get('orden') || 'default';
  const minPrice = searchParams.get('minPrecio') ? Number(searchParams.get('minPrecio')) : 0;
  const maxPrice = searchParams.get('maxPrecio') ? Number(searchParams.get('maxPrecio')) : 999;

  useEffect(() => {
    setLoading(true);
    Promise.all([getProducts(), getCategories()])
      .then(([prods, cats]) => {
        setProducts(prods);
        setCategories(cats);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = [...products];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.productName.toLowerCase().includes(q) ||
        p.productDescription.toLowerCase().includes(q)
      );
    }
    if (selectedCategory) {
      result = result.filter(p => p.category.idCategory === selectedCategory);
    }
    result = result.filter(p => p.price >= minPrice && p.price <= maxPrice);
    switch (sort) {
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'name': result.sort((a, b) => a.productName.localeCompare(b.productName)); break;
    }
    return result;
  }, [products, search, selectedCategory, sort, minPrice, maxPrice]);

  const set = (key: string, val: string | null) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (val === null || val === '') next.delete(key);
      else next.set(key, val);
      return next;
    });
  };

  const clearAll = () => setSearchParams({});

  const activeCategory = categories.find(c => c.idCategory === selectedCategory);
  const hasFilters = !!(search || selectedCategory || sort !== 'default');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-16">
      {/* Header */}
      <div className="mb-10">
        <p className="text-primary tracking-widest uppercase text-xs mb-2" style={{ fontFamily: 'Lato, sans-serif', letterSpacing: '0.3em' }}>
          {activeCategory ? activeCategory.categoryName : 'Todo'}
        </p>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>
          {activeCategory ? activeCategory.categoryName : 'Catálogo'}
        </h1>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => set('q', e.target.value)}
            placeholder="Buscar prendas..."
            className="w-full pl-10 pr-4 py-3 rounded-full bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm"
            style={{ fontFamily: 'Lato, sans-serif' }}
          />
          {search && (
            <button onClick={() => set('q', null)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            value={sort}
            onChange={e => set('orden', e.target.value)}
            className="appearance-none pl-4 pr-10 py-3 rounded-full bg-card border border-border text-foreground text-sm focus:outline-none focus:border-primary cursor-pointer"
            style={{ fontFamily: 'Lato, sans-serif' }}
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>

        {/* Filters toggle (mobile) */}
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="sm:hidden flex items-center gap-2 px-4 py-3 rounded-full bg-card border border-border text-foreground text-sm"
          style={{ fontFamily: 'Lato, sans-serif' }}
        >
          <SlidersHorizontal size={15} />
          Filtros
          {hasFilters && <span className="w-2 h-2 rounded-full bg-primary" />}
        </button>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className={`${filtersOpen ? 'block' : 'hidden'} sm:block w-full sm:w-56 shrink-0`}>
          <div className="bg-card border border-border rounded-2xl p-5 sticky top-24">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-foreground text-sm" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 700 }}>Filtros</h3>
              {hasFilters && (
                <button
                  onClick={clearAll}
                  className="text-xs text-primary hover:underline"
                  style={{ fontFamily: 'Lato, sans-serif' }}
                >
                  Limpiar
                </button>
              )}
            </div>

            {/* Categories */}
            <div className="mb-6">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3" style={{ fontFamily: 'Lato, sans-serif', letterSpacing: '0.15em' }}>
                Categoría
              </p>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => set('categoria', null)}
                  className={`text-left text-sm px-3 py-2 rounded-lg transition-colors ${!selectedCategory ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'}`}
                  style={{ fontFamily: 'Lato, sans-serif' }}
                >
                  Todas
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.idCategory}
                    onClick={() => set('categoria', String(cat.idCategory))}
                    className={`text-left text-sm px-3 py-2 rounded-lg transition-colors ${selectedCategory === cat.idCategory ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'}`}
                    style={{ fontFamily: 'Lato, sans-serif' }}
                  >
                    {cat.categoryName}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3" style={{ fontFamily: 'Lato, sans-serif', letterSpacing: '0.15em' }}>
                Precio
              </p>
              <div className="flex flex-col gap-2">
                {[
                  { label: 'Hasta $50', min: 0, max: 50 },
                  { label: '$50 – $80', min: 50, max: 80 },
                  { label: '$80 – $110', min: 80, max: 110 },
                  { label: 'Más de $110', min: 110, max: 999 },
                ].map(range => {
                  const active = minPrice === range.min && maxPrice === range.max;
                  return (
                    <button
                      key={range.label}
                      onClick={() => {
                        if (active) { set('minPrecio', null); set('maxPrecio', null); }
                        else { set('minPrecio', String(range.min)); set('maxPrecio', String(range.max)); }
                      }}
                      className={`text-left text-sm px-3 py-2 rounded-lg transition-colors ${active ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'}`}
                      style={{ fontFamily: 'Lato, sans-serif' }}
                    >
                      {range.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground" style={{ fontFamily: 'Lato, sans-serif' }}>
              {loading ? 'Cargando...' : `${filtered.length} producto${filtered.length !== 1 ? 's' : ''}`}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-muted rounded-2xl mb-3" />
                  <div className="h-3 bg-muted rounded w-1/2 mb-2" />
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-muted-foreground text-lg mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                Sin resultados
              </p>
              <p className="text-muted-foreground text-sm mb-6" style={{ fontFamily: 'Lato, sans-serif' }}>
                Intentá con otros términos o limpiá los filtros
              </p>
              <button
                onClick={clearAll}
                className="text-primary text-sm underline"
                style={{ fontFamily: 'Lato, sans-serif' }}
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filtered.map(product => (
                <ProductCard key={product.idProduct} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
