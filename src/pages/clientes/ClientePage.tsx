import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getCliente, deleteCliente } from '../../api/clientes';
import { getErrorMessage } from '../../api/errors';
import { deleteRutina, getRutinaCliente } from '../../api/rutinas';
import RutinaView from '../../components/rutinas/RutinaView';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import LoadingState from '../../components/ui/LoadingState';
import { ageFromBirthdate, clienteNombreCompleto } from '../../lib/format';
import { SquarePen, SquarePlus, Trash } from 'lucide-react';
import { btnDanger, btnSecondary, iconClass } from '../../components/ui/formStyles';
import type { Cliente, Rutina } from '../../types';

export default function ClientePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const idCliente = Number(id);
  const idValido = Number.isInteger(idCliente) && idCliente > 0;

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [rutina, setRutina] = useState<Rutina | null>(null);
  const [cargando, setCargando] = useState(idValido);
  const [error, setError] = useState<string | null>(idValido ? null : 'Cliente inválido.');

  useEffect(() => {
    if (!idValido) return;

    let cancelled = false;

    const cargar = async () => {
      try {
        setCargando(true);
        setError(null);

        const [clienteData, rutinaData] = await Promise.all([
          getCliente(idCliente),
          getRutinaCliente(idCliente),
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
  }, [idCliente, idValido]);

  if (cargando) return <LoadingState message="Cargando ficha del cliente..." />;
  if (error) return <ErrorState message={error} />;
  if (!cliente) {
    return (
      <EmptyState
        title="Cliente no encontrado"
        message="Revisa el listado e intenta de nuevo."
      />
    );
  }

  const edad = ageFromBirthdate(cliente.fecha_nacimiento);

  return (
    <section>
      <Link
        to="/clientes"
        className="mb-4 inline-block text-sm text-muted no-underline hover:text-neon"
      >
        ← Volver a clientes
      </Link>

      <header className="mb-7 flex flex-col gap-4 rounded-[10px] border border-neon bg-notes px-4 py-4 sm:flex-row sm:items-center">
        <span className="hidden w-1.5 self-stretch shrink-0 rounded-full bg-neon sm:block" aria-hidden />
        <h1 className="min-w-0 text-2xl font-extrabold break-words text-heading sm:text-[28px]">
          {clienteNombreCompleto(cliente.nombre, cliente.apellido)}
        </h1>
        <div className="flex flex-wrap items-center gap-3 sm:ml-auto sm:justify-end">
          <div className="flex min-w-[120px] flex-col gap-1">
            <span className="font-display text-[13px] font-bold uppercase tracking-wider text-neon">
              Teléfono
            </span>
            <span className="text-[15px] font-semibold text-heading">
              {cliente.telefono || '—'}
            </span>
          </div>
          <div className="flex min-w-[120px] flex-col gap-1">
            <span className="font-display text-[13px] font-bold uppercase tracking-wider text-neon">Edad</span>
            <span className="text-[15px] font-semibold text-heading">
              {edad !== null ? `${edad} años` : '—'}
            </span>
          </div>
          <Link className={btnSecondary} to={`/clientes/${cliente.id_cliente}/editar`}>
            <SquarePen className={iconClass} />
          </Link>
          <button
            className={btnDanger}
            type="button"
            onClick={() => {
              if (
                !window.confirm(
                  `¿Eliminar a ${clienteNombreCompleto(cliente.nombre, cliente.apellido)}? Se borrará también su rutina.`,
                )
              ) {
                return;
              }
              void deleteCliente(cliente.id_cliente)
                .then(() => navigate('/clientes'))
                .catch((err) => window.alert(getErrorMessage(err)));
            }}
          >
            <Trash className={iconClass} />
          </button>
        </div>
      </header>

      {rutina ? (
        <RutinaView
          rutina={rutina}
          actions={
            <>
              <Link className={btnSecondary} to={`/clientes/${cliente.id_cliente}/rutina/editar`}>
                <SquarePen className={iconClass} />
                Editar rutina
              </Link>
              <Link
                className={btnSecondary}
                to={`/clientes/${cliente.id_cliente}/rutina/nueva`}
                onClick={(event) => {
                  if (
                    !window.confirm(
                      `Se eliminará la rutina actual ("${rutina.nombre_rutina || 'Rutina sin nombre'}") y será reemplazada por la nueva. ¿Quieres continuar?`,
                    )
                  ) {
                    event.preventDefault();
                  }
                }}
              >
                <SquarePlus className={iconClass} />
                Nueva rutina
              </Link>
              <button
                className={btnDanger}
                type="button"
                onClick={() => {
                  if (!window.confirm('¿Eliminar la rutina de este cliente?')) return;
                  void deleteRutina(rutina.id_rutina)
                    .then(() => setRutina(null))
                    .catch((err) => window.alert(getErrorMessage(err)));
                }}
              >
                <Trash className={iconClass} />
                Eliminar
              </button>
            </>
          }
        />
      ) : (
        <>
          <EmptyState
            title="Sin rutina"
            message="Este cliente todavía no tiene una rutina asignada."
          />
          <div className="mt-4">
            <Link className={btnSecondary} to={`/clientes/${cliente.id_cliente}/rutina/nueva`}>
              <SquarePlus className={iconClass} />
              Nueva rutina
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
