import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { toast } from 'sonner';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (form.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('¡Cuenta creada! Bienvenida a Alma Boho 🌿');
      navigate('/');
    } catch (err: any) {
      toast.error(err.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] grid md:grid-cols-2">
      {/* Form side */}
      <div className="flex items-center justify-center px-6 py-16 bg-background order-2 md:order-1">
        <div className="w-full max-w-sm">
          <div className="mb-10 text-center">
            <p className="text-primary tracking-widest uppercase text-xs mb-3" style={{ fontFamily: 'Lato, sans-serif', letterSpacing: '0.3em' }}>
              Únete a nosotras
            </p>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem' }}>
              Crear cuenta
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm text-foreground mb-1.5" style={{ fontFamily: 'Lato, sans-serif' }}>
                Nombre completo
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="Tu nombre"
                className="w-full px-4 py-3 rounded-xl bg-input-background border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary"
                style={{ fontFamily: 'Lato, sans-serif' }}
              />
            </div>

            <div>
              <label className="block text-sm text-foreground mb-1.5" style={{ fontFamily: 'Lato, sans-serif' }}>
                Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => set('email', e.target.value)}
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
                  minLength={6}
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-4 py-3 pr-11 rounded-xl bg-input-background border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary"
                  style={{ fontFamily: 'Lato, sans-serif' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-foreground mb-1.5" style={{ fontFamily: 'Lato, sans-serif' }}>
                Repetir contraseña
              </label>
              <input
                type={showPwd ? 'text' : 'password'}
                required
                value={form.confirm}
                onChange={e => set('confirm', e.target.value)}
                placeholder="Repetí tu contraseña"
                className={`w-full px-4 py-3 rounded-xl bg-input-background border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary ${
                  form.confirm && form.confirm !== form.password ? 'border-destructive' : 'border-border'
                }`}
                style={{ fontFamily: 'Lato, sans-serif' }}
              />
              {form.confirm && form.confirm !== form.password && (
                <p className="text-xs text-destructive mt-1" style={{ fontFamily: 'Lato, sans-serif' }}>
                  Las contraseñas no coinciden
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || (!!form.confirm && form.confirm !== form.password)}
              className="w-full py-4 bg-primary text-primary-foreground rounded-full text-sm hover:bg-primary/90 transition-colors disabled:opacity-70 mt-2"
              style={{ fontFamily: 'Lato, sans-serif', letterSpacing: '0.05em' }}
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground" style={{ fontFamily: 'Lato, sans-serif' }}>
              ¿Ya tenés cuenta?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Iniciar sesión
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Image side */}
      <div className="hidden md:block relative order-1 md:order-2">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1624633100912-2fc4f1002778?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=900&q=85"
          alt="Alma Boho"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-foreground/20" />
        <div className="absolute bottom-12 left-12 right-12">
          <p className="text-background leading-tight" style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem' }}>
            Únete a nuestra comunidad bohemia
          </p>
        </div>
      </div>
    </div>
  );
}
