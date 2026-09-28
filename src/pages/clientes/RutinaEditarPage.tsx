import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { listEjerciciosCatalogo, listGruposMusculares } from '../../api/catalogo';
import { getCliente } from '../../api/clientes';
import { getErrorMessage } from '../../api/errors';
import { getRutina, saveRutina } from '../../api/rutinas';
import RutinaForm from '../../components/rutinas/RutinaForm';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import LoadingState from '../../components/ui/LoadingState';
import { clienteNombreCompleto } from '../../lib/format';
import type { Cliente, EjercicioCatalogo, GrupoMuscular, Rutina } from '../../types';

export default function RutinaEditarPage() {
  const { id, rutinaId } = useParams();
  const idCliente = Number(id);
  const idRutina = Number(rutinaId);
  const idsValidos =
    Number.isInteger(idCliente) &&
    idCliente > 0 &&
    Number.isInteger(idRutina) &&
    idRutina > 0;
  const navigate = useNavigate();

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [rutina, setRutina] = useState<Rutina | null>(null);
  const [grupos, setGrupos] = useState<GrupoMuscular[]>([]);
  const [ejercicios, setEjercicios] = useState<EjercicioCatalogo[]>([]);
  const [cargando, setCargando] = useState(idsValidos);
  const [error, setError] = useState<string | null>(idsValidos ? null : 'Ruta inválida.');

  useEffect(() => {
    if (!idsValidos) return;
    let cancelled = false;

    const cargar = async () => {
      try {
        setCargando(true);
        const [clienteData, rutinaData, gruposData, ejerciciosData] = await Promise.all([
          getCliente(idCliente),
          getRutina(idRutina),
          listGruposMusculares(),
          listEjerciciosCatalogo(),
        ]);
        if (!cancelled) {
          setCliente(clienteData);
          setRutina(rutinaData);
          setGrupos(gruposData);
          setEjercicios(ejerciciosData);
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
      <Link
        to={`/clientes/${cliente.id_cliente}/rutinas/${rutina.id_rutina}`}
        className="mb-4 inline-block text-sm text-muted no-underline hover:text-neon"
      >
        ← Volver a {clienteNombreCompleto(cliente.nombre, cliente.apellido)}
      </Link>
      <h1 className="mb-6 text-[28px] font-extrabold text-heading">Editar rutina</h1>
      <RutinaForm
        idCliente={cliente.id_cliente}
        rutina={rutina}
        grupos={grupos}
        ejerciciosCatalogo={ejercicios}
        cancelTo={`/clientes/${cliente.id_cliente}/rutinas/${rutina.id_rutina}`}
        onSubmit={async (draft) => {
          await saveRutina(rutina.id_rutina, draft);
          navigate(`/clientes/${cliente.id_cliente}/rutinas/${rutina.id_rutina}`);
        }}
      />
    </section>
  );
}
