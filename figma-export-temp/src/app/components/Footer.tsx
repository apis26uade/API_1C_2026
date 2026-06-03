import { Link } from 'react-router';
import { Instagram, Facebook, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-foreground text-background mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="leading-none">
              <p className="text-primary tracking-widest uppercase text-xs" style={{ fontFamily: 'Lato, sans-serif', letterSpacing: '0.25em' }}>alma</p>
              <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', lineHeight: 1, color: '#FAF6EF' }}>Boho</p>
            </div>
            <p className="text-sm text-background/60 leading-relaxed max-w-xs" style={{ fontFamily: 'Lato, sans-serif' }}>
              Moda que respira libertad. Prendas artesanales con alma, diseñadas para la mujer que abraza su esencia natural.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <a href="#" className="text-background/50 hover:text-primary transition-colors" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-background/50 hover:text-primary transition-colors" aria-label="Facebook">
                <Facebook size={20} />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-3">
            <h4 className="text-background/90 tracking-widest uppercase text-xs mb-2" style={{ fontFamily: 'Lato, sans-serif', letterSpacing: '0.2em', fontFamily: 'Lato' }}>
              Explorar
            </h4>
            {['/', '/catalogo', '/pedidos'].map((path, i) => {
              const labels = ['Inicio', 'Catálogo', 'Mis Pedidos'];
              return (
                <Link
                  key={path}
                  to={path}
                  className="text-sm text-background/60 hover:text-primary transition-colors"
                  style={{ fontFamily: 'Lato, sans-serif' }}
                >
                  {labels[i]}
                </Link>
              );
            })}
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-3">
            <h4 className="text-background/90 tracking-widest uppercase text-xs mb-2" style={{ fontFamily: 'Lato, sans-serif', letterSpacing: '0.2em' }}>
              Contacto
            </h4>
            <p className="text-sm text-background/60" style={{ fontFamily: 'Lato, sans-serif' }}>hola@almaboho.com</p>
            <p className="text-sm text-background/60" style={{ fontFamily: 'Lato, sans-serif' }}>+54 11 4567-8901</p>
            <p className="text-sm text-background/60 mt-2" style={{ fontFamily: 'Lato, sans-serif' }}>
              Lun–Vie: 9 a 18 hs<br />
              Sáb: 10 a 14 hs
            </p>
          </div>
        </div>

        <div className="border-t border-background/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-background/40" style={{ fontFamily: 'Lato, sans-serif' }}>
            © 2026 Alma Boho. Todos los derechos reservados.
          </p>
          <p className="text-xs text-background/40 flex items-center gap-1" style={{ fontFamily: 'Lato, sans-serif' }}>
            Hecho con <Heart size={11} className="text-primary fill-primary" /> y alma
          </p>
        </div>
      </div>
    </footer>
  );
}
