import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { toast } from 'sonner';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('¡Bienvenida de vuelta!');
      navigate(from, { replace: true });
    } catch (err: any) {
      toast.error(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] grid md:grid-cols-2">
      {/* Image side */}
      <div className="hidden md:block relative">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1751243958813-8ec1669abef9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=900&q=85"
          alt="Alma Boho"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-foreground/30" />
        <div className="absolute bottom-12 left-12 right-12">
          <p className="text-background/90 text-sm mb-2" style={{ fontFamily: 'Lato, sans-serif', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Alma Boho
          </p>
          <p className="text-background leading-tight" style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem' }}>
            Moda que respira libertad
          </p>
        </div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center px-6 py-16 bg-background">
        <div className="w-full max-w-sm">
          <div className="mb-10 text-center">
            <p className="text-primary tracking-widest uppercase text-xs mb-3" style={{ fontFamily: 'Lato, sans-serif', letterSpacing: '0.3em' }}>
              Bienvenida
            </p>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem' }}>
              Iniciar sesión
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm text-foreground mb-1.5" style={{ fontFamily: 'Lato, sans-serif' }}>
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full px-4 py-3 rounded-xl bg-input-background border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary"
                style={{ fontFamily: 'Lato, sans-serif' }}
              />
            </div>

            <div>
              <label className="block text-sm text-foreground mb-1.5" style={{ fontFamily: 'Lato, sans-serif' }}>
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 rounded-xl bg-input-background border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary"
                  style={{ fontFamily: 'Lato, sans-serif' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-primary-foreground rounded-full text-sm hover:bg-primary/90 transition-colors disabled:opacity-70 mt-2"
              style={{ fontFamily: 'Lato, sans-serif', letterSpacing: '0.05em' }}
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground" style={{ fontFamily: 'Lato, sans-serif' }}>
              ¿No tenés cuenta?{' '}
              <Link to="/registro" className="text-primary hover:underline">
                Registrarse
              </Link>
            </p>
          </div>

          <div className="mt-4 p-4 bg-secondary/50 rounded-xl text-xs text-muted-foreground" style={{ fontFamily: 'Lato, sans-serif' }}>
            <p className="mb-1" style={{ fontWeight: 700 }}>💡 Demo</p>
            <p>El backend debe estar corriendo en <span className="font-mono">localhost:8080</span>. Si no está disponible, podés navegar el catálogo con datos de muestra.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
