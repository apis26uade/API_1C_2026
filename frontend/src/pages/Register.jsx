import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { EyeIcon, EyeOffIcon } from '../components/Icons.jsx'
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice.js';
import { loginUser, registerUser } from '../features/auth/authThunks.js';
import { useToast } from '../context/ToastContext.jsx'

const REGISTER_IMAGE =
  'https://images.unsplash.com/photo-1624633100912-2fc4f1002778?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=900&q=85'

function Register() {
  const navigate = useNavigate()
  const location = useLocation()
    const dispatch = useDispatch();
  const register = async (name, email, password) => { return dispatch(registerUser({ name, email, password })).unwrap(); };
  const { toastError, toastSuccess } = useToast()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const redirectTo =
    typeof location.state?.from === 'string'
      ? location.state.from
      : (location.state?.from?.pathname ?? '/')

  const passwordsMismatch =
    form.confirm.length > 0 && form.confirm !== form.password

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (form.password !== form.confirm) {
      toastError('Las contrasenas no coinciden')
      return
    }

    if (form.password.length < 6) {
      toastError('La contrasena debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)

    try {
      await register(form.name, form.email, form.password)
      toastSuccess('Cuenta creada correctamente')
      navigate(redirectTo, { replace: true })
    } catch (submitError) {
      toastError(submitError.message || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth-split-page register-layout">
      <div className="auth-split-form-panel">
        <div className="auth-split-form">
          <header className="auth-split-header">
            <p className="eyebrow">Unete a nosotras</p>
            <h1>Crear cuenta</h1>
          </header>

          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="register-name">Nombre completo</label>
              <input
                id="register-name"
                type="text"
                value={form.name}
                onChange={(event) => setField('name', event.target.value)}
                placeholder="Tu nombre"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="register-email">Email</label>
              <input
                id="register-email"
                type="email"
                value={form.email}
                onChange={(event) => setField('email', event.target.value)}
                placeholder="tu@email.com"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="register-password">Contrasena</label>
              <div className="auth-password-wrap">
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(event) => setField('password', event.target.value)}
                  placeholder="Minimo 6 caracteres"
                  minLength={6}
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

            <div className="auth-field">
              <label htmlFor="register-confirm">Repetir contrasena</label>
              <input
                id="register-confirm"
                type={showPassword ? 'text' : 'password'}
                value={form.confirm}
                onChange={(event) => setField('confirm', event.target.value)}
                placeholder="Repeti tu contrasena"
                className={passwordsMismatch ? 'input-invalid' : ''}
                required
              />
              {passwordsMismatch ? (
                <p className="auth-field-hint">Las contrasenas no coinciden</p>
              ) : null}
            </div>

            <button
              className="auth-submit-btn"
              type="submit"
              disabled={loading || passwordsMismatch}
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <p className="auth-footer-link">
            Ya tenes cuenta? <Link to="/login">Iniciar sesion</Link>
          </p>
        </div>
      </div>

      <div className="auth-split-image register-panel" aria-hidden="true">
        <img src={REGISTER_IMAGE} alt="" />
        <div className="auth-split-caption">
          <h2>Unete a nuestra comunidad bohemia</h2>
        </div>
      </div>
    </section>
  )
}

export default Register
