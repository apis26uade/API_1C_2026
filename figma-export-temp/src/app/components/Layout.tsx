import { Outlet } from 'react-router';
import { Toaster } from 'sonner';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#FFFCF7',
            color: '#2A1A0E',
            border: '1px solid rgba(184,102,58,0.2)',
            borderRadius: '12px',
            fontFamily: 'Lato, sans-serif',
          },
        }}
      />
    </div>
  );
}
