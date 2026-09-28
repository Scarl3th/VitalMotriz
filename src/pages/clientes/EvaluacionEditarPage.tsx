import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getCliente } from '../../api/clientes';
import { getEvaluacion, updateEvaluacion } from '../../api/evaluaciones';
import { getErrorMessage } from '../../api/errors';
import EvaluacionForm from '../../components/evaluaciones/EvaluacionForm';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import LoadingState from '../../components/ui/LoadingState';
import { clienteNombreCompleto } from '../../lib/format';
import type { Cliente, EvaluacionFisica } from '../../types';

export default function EvaluacionEditarPage() {
  const { id, evaluacionId } = useParams();
  const idCliente = Number(id);
  const idEvaluacion = Number(evaluacionId);
  const idsValidos =
    Number.isInteger(idCliente) &&
    idCliente > 0 &&
    Number.isInteger(idEvaluacion) &&
    idEvaluacion > 0;
  const navigate = useNavigate();

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
        const [clienteData, evaluacionData] = await Promise.all([
          getCliente(idCliente),
          getEvaluacion(idEvaluacion),
        ]);
        if (!cancelled) {
          setCliente(clienteData);
          setEvaluacion(evaluacionData);
        }
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
      <Link
        to={`/clientes/${cliente.id_cliente}/evaluaciones/${evaluacion.id_evaluacion}`}
        className="mb-4 inline-block text-sm text-muted no-underline hover:text-neon"
      >
        ← Volver a {clienteNombreCompleto(cliente.nombre, cliente.apellido)}
      </Link>
      <h1 className="mb-6 text-[28px] font-extrabold text-heading">Editar evaluación</h1>
      <EvaluacionForm
        idCliente={cliente.id_cliente}
        evaluacion={evaluacion}
        cancelTo={`/clientes/${cliente.id_cliente}/evaluaciones/${evaluacion.id_evaluacion}`}
        onSubmit={async (input) => {
          await updateEvaluacion(evaluacion.id_evaluacion, input);
          navigate(`/clientes/${cliente.id_cliente}/evaluaciones/${evaluacion.id_evaluacion}`);
        }}
      />
    </section>
  );
}
