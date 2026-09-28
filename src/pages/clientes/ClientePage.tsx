import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getCliente, deleteCliente } from '../../api/clientes';
import { listEvaluaciones } from '../../api/evaluaciones';
import { getErrorMessage } from '../../api/errors';
import { getRutinaActiva, listRutinas } from '../../api/rutinas';
import EvaluacionesList from '../../components/evaluaciones/EvaluacionesList';
import RutinaView from '../../components/rutinas/RutinaView';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import LoadingState from '../../components/ui/LoadingState';
import { cn } from '../../lib/cn';
import { ageFromBirthdate, clienteNombreCompleto, formatDate, formatEstado } from '../../lib/format';
import { btnDanger, btnSecondary } from '../../components/ui/formStyles';
import type { Cliente, EvaluacionFisica, Rutina, RutinaResumen } from '../../types';

type Tab = 'rutina' | 'evaluaciones';

export default function ClientePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const idCliente = Number(id);
  const idValido = Number.isInteger(idCliente) && idCliente > 0;
  const [searchParams, setSearchParams] = useSearchParams();
  const tab: Tab = searchParams.get('tab') === 'evaluaciones' ? 'evaluaciones' : 'rutina';

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [rutinaActiva, setRutinaActiva] = useState<Rutina | null>(null);
  const [rutinas, setRutinas] = useState<RutinaResumen[]>([]);
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionFisica[]>([]);
  const [cargando, setCargando] = useState(idValido);
  const [error, setError] = useState<string | null>(idValido ? null : 'Cliente inválido.');

  useEffect(() => {
    if (!idValido) return;

    let cancelled = false;

    const cargar = async () => {
      try {
        setCargando(true);
        setError(null);

        const [clienteData, rutinaData, rutinasData, evaluacionesData] = await Promise.all([
          getCliente(idCliente),
          getRutinaActiva(idCliente),
          listRutinas(idCliente),
          listEvaluaciones(idCliente),
        ]);

        if (cancelled) return;
        setCliente(clienteData);
        setRutinaActiva(rutinaData);
        setRutinas(rutinasData);
        setEvaluaciones(evaluacionesData);
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

  const otrasRutinas = useMemo(
    () => rutinas.filter((rutina) => rutina.id_rutina !== rutinaActiva?.id_rutina),
    [rutinas, rutinaActiva],
  );

  const setTab = (next: Tab) => {
    if (next === 'evaluaciones') {
      setSearchParams({ tab: 'evaluaciones' });
      return;
    }
    setSearchParams({});
  };

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
            <span className="text-[11px] font-bold uppercase tracking-wider text-neon">
              Teléfono
            </span>
            <span className="text-[15px] font-semibold text-heading">
              {cliente.telefono || '—'}
            </span>
          </div>
          <div className="flex min-w-[120px] flex-col gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neon">Edad</span>
            <span className="text-[15px] font-semibold text-heading">
              {edad !== null ? `${edad} años` : '—'}
            </span>
          </div>
          <Link className={btnSecondary} to={`/clientes/${cliente.id_cliente}/editar`}>
            Editar
          </Link>
          <button
            className={btnDanger}
            type="button"
            onClick={() => {
              if (
                !window.confirm(
                  `¿Eliminar a ${clienteNombreCompleto(cliente.nombre, cliente.apellido)}? Se borrarán también sus rutinas y evaluaciones.`,
                )
              ) {
                return;
              }
              void deleteCliente(cliente.id_cliente)
                .then(() => navigate('/clientes'))
                .catch((err) => window.alert(getErrorMessage(err)));
            }}
          >
            Eliminar
          </button>
        </div>
      </header>

      <div className="mb-6 flex gap-2 border-b border-line">
        <button
          type="button"
          className={cn(
            '-mb-px cursor-pointer border-0 border-b-2 bg-transparent px-3.5 py-2.5',
            tab === 'rutina'
              ? 'border-neon font-bold text-neon'
              : 'border-transparent text-muted hover:text-heading',
          )}
          onClick={() => setTab('rutina')}
        >
          Rutina
        </button>
        <button
          type="button"
          className={cn(
            '-mb-px cursor-pointer border-0 border-b-2 bg-transparent px-3.5 py-2.5',
            tab === 'evaluaciones'
              ? 'border-neon font-bold text-neon'
              : 'border-transparent text-muted hover:text-heading',
          )}
          onClick={() => setTab('evaluaciones')}
        >
          Evaluaciones
        </button>
      </div>

      {tab === 'rutina' && (
        <>
          {rutinaActiva ? (
            <>
              <div className="mb-4 flex flex-wrap justify-end gap-2">
                <Link
                  className={btnSecondary}
                  to={`/clientes/${cliente.id_cliente}/rutinas/${rutinaActiva.id_rutina}/editar`}
                >
                  Editar rutina
                </Link>
                <Link className={btnSecondary} to={`/clientes/${cliente.id_cliente}/rutinas/nueva`}>
                  Nueva rutina
                </Link>
              </div>
              <RutinaView rutina={rutinaActiva} />
            </>
          ) : (
            <EmptyState
              title="Sin rutina activa"
              message="Este cliente no tiene una rutina activa en este momento."
            />
          )}

          {!rutinaActiva && (
            <div className="mt-4">
              <Link className={btnSecondary} to={`/clientes/${cliente.id_cliente}/rutinas/nueva`}>
                Nueva rutina
              </Link>
            </div>
          )}

          {otrasRutinas.length > 0 && (
            <>
              <h2 className="mb-3 mt-7 text-base font-bold text-heading">Otras rutinas</h2>
              <div className="overflow-x-auto rounded-[10px] border border-line bg-surface">
                <table className="w-full min-w-[36rem] text-left">
                  <thead>
                    <tr>
                      <th className="border-b border-line px-3.5 py-2.5 text-[11px] uppercase tracking-wider text-muted">
                        Nombre
                      </th>
                      <th className="border-b border-line px-3.5 py-2.5 text-[11px] uppercase tracking-wider text-muted">
                        Estado
                      </th>
                      <th className="border-b border-line px-3.5 py-2.5 text-[11px] uppercase tracking-wider text-muted">
                        Inicio
                      </th>
                      <th className="border-b border-line px-3.5 py-2.5 text-[11px] uppercase tracking-wider text-muted">
                        Fin
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {otrasRutinas.map((rutina) => (
                      <tr
                        key={rutina.id_rutina}
                        className="cursor-pointer hover:bg-surface-hover"
                        onClick={() =>
                          navigate(`/clientes/${cliente.id_cliente}/rutinas/${rutina.id_rutina}`)
                        }
                      >
                        <td className="border-b border-line px-3.5 py-3 font-semibold text-neon">
                          {rutina.nombre_rutina || 'Rutina sin nombre'}
                        </td>
                        <td className="border-b border-line px-3.5 py-3">{formatEstado(rutina.estado)}</td>
                        <td className="border-b border-line px-3.5 py-3">
                          {formatDate(rutina.fecha_inicio)}
                        </td>
                        <td className="border-b border-line px-3.5 py-3">
                          {formatDate(rutina.fecha_fin)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}

      {tab === 'evaluaciones' && (
        <>
          <div className="mb-4 flex justify-end">
            <Link className={btnSecondary} to={`/clientes/${cliente.id_cliente}/evaluaciones/nueva`}>
              Nueva evaluación
            </Link>
          </div>
          {evaluaciones.length > 0 ? (
            <EvaluacionesList idCliente={cliente.id_cliente} evaluaciones={evaluaciones} />
          ) : (
            <EmptyState
              title="Sin evaluaciones"
              message="Este cliente todavía no tiene evaluaciones físicas."
            />
          )}
        </>
      )}
    </section>
  );
}
