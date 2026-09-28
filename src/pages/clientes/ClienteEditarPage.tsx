import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getCliente, updateCliente } from '../../api/clientes';
import { getErrorMessage } from '../../api/errors';
import ClienteForm from '../../components/clientes/ClienteForm';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import LoadingState from '../../components/ui/LoadingState';
import type { Cliente } from '../../types';

export default function ClienteEditarPage() {
  const { id } = useParams();
  const idCliente = Number(id);
  const idValido = Number.isInteger(idCliente) && idCliente > 0;
  const navigate = useNavigate();

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [cargando, setCargando] = useState(idValido);
  const [error, setError] = useState<string | null>(idValido ? null : 'Cliente inválido.');

  useEffect(() => {
    if (!idValido) return;
    let cancelled = false;

    const cargar = async () => {
      try {
        setCargando(true);
        setError(null);
        const data = await getCliente(idCliente);
        if (!cancelled) setCliente(data);
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
  }, [idCliente, idValido]);

  if (cargando) return <LoadingState message="Cargando cliente..." />;
  if (error) return <ErrorState message={error} />;
  if (!cliente) {
    return <EmptyState title="Cliente no encontrado" message="Revisa el listado e intenta de nuevo." />;
  }

  return (
    <section>
      <Link
        to={`/clientes/${cliente.id_cliente}`}
        className="mb-4 inline-block text-sm text-muted no-underline hover:text-neon"
      >
        ← Volver a la ficha
      </Link>
      <h1 className="mb-6 text-[28px] font-extrabold text-heading">Editar cliente</h1>
      <ClienteForm
        cliente={cliente}
        cancelTo={`/clientes/${cliente.id_cliente}`}
        onSubmit={async (input) => {
          await updateCliente(cliente.id_cliente, input);
          navigate(`/clientes/${cliente.id_cliente}`);
        }}
      />
    </section>
  );
}
