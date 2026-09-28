import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listClientes } from '../../api/clientes';
import { getErrorMessage } from '../../api/errors';
import ClienteList from '../../components/clientes/ClienteList';
import ClienteSearch from '../../components/clientes/ClienteSearch';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import LoadingState from '../../components/ui/LoadingState';
import { btnPrimary } from '../../components/ui/formStyles';
import { useDebouncedValue } from '../../lib/useDebouncedValue';
import type { Cliente } from '../../types';

export default function ClientesPage() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 300);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const cargar = async () => {
      try {
        setCargando(true);
        setError(null);
        const data = await listClientes(debouncedQuery);
        if (!cancelled) setClientes(data);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setCargando(false);
      }
    };

    void cargar();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  return (
    <section>
      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="shrink-0 text-2xl font-extrabold text-heading md:text-[28px]">Clientes</h1>
        <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center md:w-auto md:flex-1 md:justify-end">
          <ClienteSearch value={query} onChange={setQuery} />
          <Link className={`${btnPrimary} w-full whitespace-nowrap px-6 sm:w-auto`} to="/clientes/nuevo">
            Nuevo cliente
          </Link>
        </div>
      </header>

      {cargando && <LoadingState message="Cargando clientes..." />}
      {!cargando && error && <ErrorState message={error} />}
      {!cargando && !error && clientes.length === 0 && (
        <EmptyState
          title={debouncedQuery ? 'Sin resultados' : 'No hay clientes'}
          message={
            debouncedQuery
              ? 'No encontramos clientes con esa búsqueda.'
              : 'Todavía no hay clientes cargados.'
          }
        />
      )}
      {!cargando && !error && clientes.length > 0 && <ClienteList clientes={clientes} />}
    </section>
  );
}
