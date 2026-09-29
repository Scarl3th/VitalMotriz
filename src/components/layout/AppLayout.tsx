import type { ComponentType } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Dumbbell, Users, type LucideProps } from 'lucide-react';
import logo from '../../assets/vitalmotriz.jpg';
import { cn } from '../../lib/cn';

const navItems: { to: string; label: string; icon: ComponentType<LucideProps> }[] = [
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/catalogo', label: 'Catálogo', icon: Dumbbell },
];

export default function AppLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-10 h-16 bg-page/80 backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-[1200px] items-center gap-3 px-4 sm:px-8">
          <Link to="/clientes" className="flex min-w-0 shrink items-center">
            <img
              src={logo}
              alt="VitalMotriz"
              className="h-9 w-auto max-w-full object-contain mix-blend-lighten sm:h-10"
            />
          </Link>
          <nav className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-display text-[15px] font-semibold uppercase tracking-wide no-underline transition-colors sm:px-4',
                    isActive
                      ? 'border-neon-border bg-neon-dim text-neon'
                      : 'border-transparent text-muted hover:bg-surface-hover hover:text-heading',
                  )
                }
              >
                <Icon className="size-4 shrink-0" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-neon-border to-transparent" />
      </header>
      <main className="mx-auto w-full min-w-0 max-w-[1200px] flex-1 px-4 py-6 sm:px-8 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}
