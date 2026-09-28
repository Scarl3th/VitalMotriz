import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getCliente } from '../../api/clientes';
import { getErrorMessage } from '../../api/errors';
import { deleteRutina, getRutina } from '../../api/rutinas';
import RutinaView from '../../components/rutinas/RutinaView';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import LoadingState from '../../components/ui/LoadingState';
import { btnDanger, btnSecondary } from '../../components/ui/formStyles';
import { clienteNombreCompleto } from '../../lib/format';
import type { Cliente, Rutina } from '../../types';

export default function ClienteRutinaPage() {
  const navigate = useNavigate();
  const { id, rutinaId } = useParams();
  const idCliente = Number(id);
  const idRutina = Number(rutinaId);
  const idsValidos =
    Number.isInteger(idCliente) &&
    idCliente > 0 &&
    Number.isInteger(idRutina) &&
    idRutina > 0;

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [rutina, setRutina] = useState<Rutina | null>(null);
  const [cargando, setCargando] = useState(idsValidos);
  const [error, setError] = useState<string | null>(idsValidos ? null : 'Ruta inválida.');

  useEffect(() => {
    if (!idsValidos) return;

    let cancelled = false;

    const cargar = async () => {
      try {
        setCargando(true);
        setError(null);
        const [clienteData, rutinaData] = await Promise.all([
          getCliente(idCliente),
          getRutina(idRutina),
        ]);
        if (cancelled) return;
        setCliente(clienteData);
        setRutina(rutinaData);
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
  }, [idCliente, idRutina, idsValidos]);

  if (cargando) return <LoadingState message="Cargando rutina..." />;
  if (error) return <ErrorState message={error} />;
  if (!cliente || !rutina || rutina.id_cliente !== idCliente) {
    return (
      <EmptyState
        title="Rutina no encontrada"
        message="No pudimos encontrar esa rutina para este cliente."
      />
    );
  }

  return (
    <section>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          to={`/clientes/${cliente.id_cliente}`}
          className="text-sm text-muted no-underline hover:text-neon"
        >
          ← Volver a {clienteNombreCompleto(cliente.nombre, cliente.apellido)}
        </Link>
        <div className="flex flex-wrap gap-2">
          <Link
            className={btnSecondary}
            to={`/clientes/${cliente.id_cliente}/rutinas/${rutina.id_rutina}/editar`}
          >
            Editar
          </Link>
          <button
            className={btnDanger}
            type="button"
            onClick={() => {
              if (!window.confirm('¿Eliminar esta rutina?')) return;
              void deleteRutina(rutina.id_rutina)
                .then(() => navigate(`/clientes/${cliente.id_cliente}`))
                .catch((err) => window.alert(getErrorMessage(err)));
            }}
          >
            Eliminar
          </button>
        </div>
      </div>
      <RutinaView rutina={rutina} />
    </section>
  );
}
