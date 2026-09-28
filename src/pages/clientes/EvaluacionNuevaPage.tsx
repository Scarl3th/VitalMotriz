import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getCliente } from '../../api/clientes';
import { createEvaluacion } from '../../api/evaluaciones';
import { getErrorMessage } from '../../api/errors';
import EvaluacionForm from '../../components/evaluaciones/EvaluacionForm';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import LoadingState from '../../components/ui/LoadingState';
import { clienteNombreCompleto } from '../../lib/format';
import type { Cliente } from '../../types';

export default function EvaluacionNuevaPage() {
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
        to={`/clientes/${cliente.id_cliente}?tab=evaluaciones`}
        className="mb-4 inline-block text-sm text-muted no-underline hover:text-neon"
      >
        ← Volver a {clienteNombreCompleto(cliente.nombre, cliente.apellido)}
      </Link>
      <h1 className="mb-6 text-[28px] font-extrabold text-heading">Nueva evaluación</h1>
      <EvaluacionForm
        idCliente={cliente.id_cliente}
        cancelTo={`/clientes/${cliente.id_cliente}?tab=evaluaciones`}
        onSubmit={async (input) => {
          const creada = await createEvaluacion(input);
          navigate(`/clientes/${cliente.id_cliente}/evaluaciones/${creada.id_evaluacion}`);
        }}
      />
    </section>
  );
}
