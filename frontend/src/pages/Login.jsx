import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { EyeIcon, EyeOffIcon } from '../components/Icons.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'

const LOGIN_IMAGE =
  'https://images.unsplash.com/photo-1751243958813-8ec1669abef9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=900&q=85'

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const { syncLocalToBackend } = useCart()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const redirectTo =
    typeof location.state?.from === 'string'
      ? location.state.from
      : (location.state?.from?.pathname ?? '/')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const session = await login(email, password)
      await syncLocalToBackend(session.idUser)
      navigate(redirectTo, { replace: true })
    } catch (submitError) {
      setError(submitError.message || 'Error al iniciar sesion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth-split-page">
      <div className="auth-split-image" aria-hidden="true">
        <img src={LOGIN_IMAGE} alt="" />
        <div className="auth-split-caption">
          <p className="eyebrow-light">Alma Boho</p>
          <h2>Moda que respira libertad</h2>
        </div>
      </div>

      <div className="auth-split-form-panel">
        <div className="auth-split-form">
          <header className="auth-split-header">
            <p className="eyebrow">Bienvenida</p>
            <h1>Iniciar sesion</h1>
          </header>

          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="tu@email.com"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="login-password">Contrasena</label>
              <div className="auth-password-wrap">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  className="auth-password-toggle"
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {error ? <p className="auth-error">{error}</p> : null}

            <button className="auth-submit-btn" type="submit" disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <p className="auth-footer-link">
            No tenes cuenta? <Link to="/registro">Registrarse</Link>
          </p>

          <div className="auth-demo-box">
            <strong>Demo</strong>
            <p>
              El backend debe estar corriendo en <code>localhost:8080</code>. Si no esta
              disponible, podes navegar el catalogo con datos de muestra.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Login
