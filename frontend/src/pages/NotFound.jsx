import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <section className="content-section center-section">
      <p className="eyebrow">404</p>
      <h1>Pagina no encontrada</h1>
      <p>La ruta solicitada no existe dentro del frontend.</p>
      <Link className="button primary" to="/">
        Volver al inicio
      </Link>
    </section>
  )
}

export default NotFound
