import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { listEjerciciosCatalogo, listGruposMusculares } from '../../api/catalogo';
import { getCliente } from '../../api/clientes';
import { getErrorMessage } from '../../api/errors';
import { saveRutina } from '../../api/rutinas';
import RutinaForm from '../../components/rutinas/RutinaForm';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import LoadingState from '../../components/ui/LoadingState';
import { clienteNombreCompleto } from '../../lib/format';
import type { Cliente, EjercicioCatalogo, GrupoMuscular } from '../../types';

export default function RutinaNuevaPage() {
  const { id } = useParams();
  const idCliente = Number(id);
  const idValido = Number.isInteger(idCliente) && idCliente > 0;
  const navigate = useNavigate();

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [grupos, setGrupos] = useState<GrupoMuscular[]>([]);
  const [ejercicios, setEjercicios] = useState<EjercicioCatalogo[]>([]);
  const [cargando, setCargando] = useState(idValido);
  const [error, setError] = useState<string | null>(idValido ? null : 'Cliente inválido.');

  useEffect(() => {
    if (!idValido) return;
    let cancelled = false;

    const cargar = async () => {
      try {
        setCargando(true);
        const [clienteData, gruposData, ejerciciosData] = await Promise.all([
          getCliente(idCliente),
          listGruposMusculares(),
          listEjerciciosCatalogo(),
        ]);
        if (!cancelled) {
          setCliente(clienteData);
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
  }, [idCliente, idValido]);

  if (cargando) return <LoadingState message="Cargando formulario..." />;
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
        ← Volver a {clienteNombreCompleto(cliente.nombre, cliente.apellido)}
      </Link>
      <h1 className="mb-6 text-[28px] font-extrabold text-heading">Nueva rutina</h1>
      <RutinaForm
        idCliente={cliente.id_cliente}
        grupos={grupos}
        ejerciciosCatalogo={ejercicios}
        cancelTo={`/clientes/${cliente.id_cliente}`}
        onSubmit={async (draft) => {
          await saveRutina(null, draft);
          navigate(`/clientes/${cliente.id_cliente}`);
        }}
      />
    </section>
  );
}
