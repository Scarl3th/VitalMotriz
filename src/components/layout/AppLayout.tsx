import { Link, Outlet } from 'react-router-dom';

export default function AppLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-10 h-16 border-b border-line bg-page">
        <div className="mx-auto flex h-full max-w-[1200px] items-center gap-3 px-4 sm:px-8">
          <Link
            to="/clientes"
            className="min-w-0 truncate text-[15px] font-extrabold uppercase tracking-[0.08em] text-heading no-underline"
          >
            Vital<span className="text-neon">Motriz</span>
          </Link>
          <nav className="ml-auto flex shrink-0 gap-3 text-sm font-semibold sm:gap-5">
            <Link to="/clientes" className="text-muted no-underline hover:text-neon">
              Clientes
            </Link>
            <Link to="/catalogo" className="text-muted no-underline hover:text-neon">
              Catálogo
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full min-w-0 max-w-[1200px] flex-1 px-4 py-6 sm:px-8 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}
