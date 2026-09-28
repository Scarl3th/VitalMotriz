import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getCliente } from '../../api/clientes';
import { deleteEvaluacion, getEvaluacion } from '../../api/evaluaciones';
import { getErrorMessage } from '../../api/errors';
import EvaluacionView from '../../components/evaluaciones/EvaluacionView';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import LoadingState from '../../components/ui/LoadingState';
import { btnDanger, btnSecondary } from '../../components/ui/formStyles';
import { clienteNombreCompleto } from '../../lib/format';
import type { Cliente, EvaluacionFisica } from '../../types';

export default function ClienteEvaluacionPage() {
  const navigate = useNavigate();
  const { id, evaluacionId } = useParams();
  const idCliente = Number(id);
  const idEvaluacion = Number(evaluacionId);
  const idsValidos =
    Number.isInteger(idCliente) &&
    idCliente > 0 &&
    Number.isInteger(idEvaluacion) &&
    idEvaluacion > 0;

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [evaluacion, setEvaluacion] = useState<EvaluacionFisica | null>(null);
  const [cargando, setCargando] = useState(idsValidos);
  const [error, setError] = useState<string | null>(idsValidos ? null : 'Ruta inválida.');

  useEffect(() => {
    if (!idsValidos) return;

    let cancelled = false;

    const cargar = async () => {
      try {
        setCargando(true);
        setError(null);
        const [clienteData, evaluacionData] = await Promise.all([
          getCliente(idCliente),
          getEvaluacion(idEvaluacion),
        ]);
        if (cancelled) return;
        setCliente(clienteData);
        setEvaluacion(evaluacionData);
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
  }, [idCliente, idEvaluacion, idsValidos]);

  if (cargando) return <LoadingState message="Cargando evaluación..." />;
  if (error) return <ErrorState message={error} />;
  if (!cliente || !evaluacion || evaluacion.id_cliente !== idCliente) {
    return (
      <EmptyState
        title="Evaluación no encontrada"
        message="No pudimos encontrar esa evaluación para este cliente."
      />
    );
  }

  return (
    <section>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          to={`/clientes/${cliente.id_cliente}?tab=evaluaciones`}
          className="text-sm text-muted no-underline hover:text-neon"
        >
          ← Volver a {clienteNombreCompleto(cliente.nombre, cliente.apellido)}
        </Link>
        <div className="flex flex-wrap gap-2">
          <Link
            className={btnSecondary}
            to={`/clientes/${cliente.id_cliente}/evaluaciones/${evaluacion.id_evaluacion}/editar`}
          >
            Editar
          </Link>
          <button
            className={btnDanger}
            type="button"
            onClick={() => {
              if (!window.confirm('¿Eliminar esta evaluación?')) return;
              void deleteEvaluacion(evaluacion.id_evaluacion)
                .then(() => navigate(`/clientes/${cliente.id_cliente}?tab=evaluaciones`))
                .catch((err) => window.alert(getErrorMessage(err)));
            }}
          >
            Eliminar
          </button>
        </div>
      </div>
      <EvaluacionView
        nombreCliente={clienteNombreCompleto(cliente.nombre, cliente.apellido)}
        evaluacion={evaluacion}
      />
    </section>
  );
}
