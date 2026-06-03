import { Link } from 'react-router-dom'
import { FacebookIcon, HeartIcon, InstagramIcon } from './Icons.jsx'

const exploreLinks = [
  { to: '/', label: 'Inicio' },
  { to: '/catalogo', label: 'Catalogo' },
  { to: '/contacto', label: 'Contacto' },
]

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-grid">
          <div className="site-footer-brand">
            <div className="site-footer-logo">
              <p className="logo-eyebrow">alma</p>
              <p className="logo-title">Boho</p>
            </div>
            <p className="site-footer-tagline">
              Moda que respira libertad. Prendas artesanales con alma, disenadas para la mujer
              que abraza su esencia natural.
            </p>
            <div className="site-footer-social">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
                <InstagramIcon />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
                <FacebookIcon />
              </a>
            </div>
          </div>

          <div className="site-footer-col">
            <h4>Explorar</h4>
            {exploreLinks.map(({ to, label }) => (
              <Link key={to} to={to}>
                {label}
              </Link>
            ))}
          </div>

          <div className="site-footer-col">
            <h4>Contacto</h4>
            <p>hola@almaboho.com</p>
            <p>+54 11 4567-8901</p>
            <p>
              Lun–Vie: 9 a 18 hs
              <br />
              Sab: 10 a 14 hs
            </p>
          </div>
        </div>

        <div className="site-footer-bottom">
          <p>© 2026 Alma Boho. Todos los derechos reservados.</p>
          <p className="site-footer-made">
            Hecho con <HeartIcon /> y alma
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
