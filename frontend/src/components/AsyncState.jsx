export function PageLoader({ message = 'Cargando...' }) {
  return (
    <section className="section-container center-section">
      <p className="eyebrow">{message}</p>
      <p className="async-hint">Espera un momento, estamos consultando el servidor.</p>
    </section>
  )
}

export function PageError({ message, onRetry }) {
  return (
    <section className="section-container center-section">
      <h2>No se pudieron cargar los datos</h2>
      <p className="auth-error">{message}</p>
      {onRetry ? (
        <button className="button primary" type="button" onClick={onRetry}>
          Reintentar
        </button>
      ) : null}
    </section>
  )
}
