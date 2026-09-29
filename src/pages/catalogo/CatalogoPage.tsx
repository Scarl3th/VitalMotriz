import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  createEjercicioCatalogo,
  createGrupoMuscular,
  deleteEjercicioCatalogo,
  deleteGrupoMuscular,
  listEjerciciosCatalogo,
  listGruposMusculares,
  updateEjercicioCatalogo,
  updateGrupoMuscular,
} from '../../api/catalogo';
import { getErrorMessage } from '../../api/errors';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import LoadingState from '../../components/ui/LoadingState';
import { Save, SquarePen, SquarePlus, Trash, X } from 'lucide-react';
import {
  btnPrimary,
  btnSecondary,
  iconBtnDanger,
  iconBtnSecondary,
  iconClass,
  inputClass,
  labelClass,
} from '../../components/ui/formStyles';
import { emptyToNull, normalizeText as normalizar } from '../../lib/format';
import type { EjercicioCatalogo, GrupoMuscular } from '../../types';

export default function CatalogoPage() {
  const [grupos, setGrupos] = useState<GrupoMuscular[]>([]);
  const [ejercicios, setEjercicios] = useState<EjercicioCatalogo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [nombreGrupo, setNombreGrupo] = useState('');
  const [editandoGrupo, setEditandoGrupo] = useState<number | null>(null);
  const [mostrandoFormGrupo, setMostrandoFormGrupo] = useState(false);
  const [busquedaGrupo, setBusquedaGrupo] = useState('');

  const [nombreEjercicio, setNombreEjercicio] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [gruposEjercicio, setGruposEjercicio] = useState<number[]>([]);
  const [editandoEjercicio, setEditandoEjercicio] = useState<number | null>(null);
  const [mostrandoFormEjercicio, setMostrandoFormEjercicio] = useState(false);
  const [busquedaEjercicio, setBusquedaEjercicio] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const gruposFiltrados = useMemo(() => {
    const termino = normalizar(busquedaGrupo);
    if (!termino) return grupos;
    return grupos.filter((grupo) => normalizar(grupo.nombre).includes(termino));
  }, [grupos, busquedaGrupo]);

  const ejerciciosFiltrados = useMemo(() => {
    const termino = normalizar(busquedaEjercicio);
    if (!termino) return ejercicios;
    return ejercicios.filter((ejercicio) =>
      [
        ejercicio.nombre_ejercicio,
        ejercicio.descripcion ?? '',
        ...ejercicio.grupos_musculares.map((grupo) => grupo.nombre),
      ].some((texto) => normalizar(texto).includes(termino)),
    );
  }, [ejercicios, busquedaEjercicio]);

  const recargar = async () => {
    const [gruposData, ejerciciosData] = await Promise.all([
      listGruposMusculares(),
      listEjerciciosCatalogo(),
    ]);
    setGrupos(gruposData);
    setEjercicios(ejerciciosData);
  };

  useEffect(() => {
    let cancelled = false;
    const cargar = async () => {
      try {
        setCargando(true);
        await recargar();
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
  }, []);

  const resetEjercicioForm = () => {
    setNombreEjercicio('');
    setDescripcion('');
    setGruposEjercicio([]);
    setEditandoEjercicio(null);
    setMostrandoFormEjercicio(false);
  };

  const resetGrupoForm = () => {
    setNombreGrupo('');
    setEditandoGrupo(null);
    setMostrandoFormGrupo(false);
  };

  const guardarGrupo = async (event: FormEvent) => {
    event.preventDefault();
    if (!nombreGrupo.trim()) return;
    try {
      setFormError(null);
      if (editandoGrupo) {
        await updateGrupoMuscular(editandoGrupo, nombreGrupo.trim());
      } else {
        await createGrupoMuscular(nombreGrupo.trim());
      }
      resetGrupoForm();
      await recargar();
    } catch (err) {
      setFormError(getErrorMessage(err));
    }
  };

  const guardarEjercicio = async (event: FormEvent) => {
    event.preventDefault();
    if (!nombreEjercicio.trim()) return;
    try {
      setFormError(null);
      const payload = {
        nombre_ejercicio: nombreEjercicio.trim(),
        descripcion: emptyToNull(descripcion),
        id_grupos: gruposEjercicio,
      };
      if (editandoEjercicio) {
        await updateEjercicioCatalogo(editandoEjercicio, payload);
      } else {
        await createEjercicioCatalogo(payload);
      }
      resetEjercicioForm();
      await recargar();
    } catch (err) {
      setFormError(getErrorMessage(err));
    }
  };

  const toggleGrupoEjercicio = (id: number) => {
    setGruposEjercicio((actual) =>
      actual.includes(id) ? actual.filter((item) => item !== id) : [...actual, id],
    );
  };

  if (cargando) return <LoadingState message="Cargando catálogo..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <section>
      <h1 className="mb-2 text-[28px] font-extrabold text-heading">Catálogo</h1>
      <p className="mb-6 text-muted">Grupos musculares y ejercicios que se usan en las rutinas.</p>
      {formError && <p className="mb-4 text-sm text-danger">{formError}</p>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-[10px] border border-line bg-surface p-5">
          <h2 className="mb-4 text-lg font-bold text-heading">Grupos musculares</h2>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row">
            <input
              className={inputClass}
              type="search"
              value={busquedaGrupo}
              onChange={(e) => setBusquedaGrupo(e.target.value)}
              placeholder="Buscar grupo muscular"
              aria-label="Buscar grupo muscular"
            />
            <button
              className={`${btnPrimary} shrink-0`}
              type="button"
              onClick={() => {
                resetGrupoForm();
                setMostrandoFormGrupo(true);
              }}
            >
              <SquarePlus className={iconClass} />
              Agregar
            </button>
          </div>

          {mostrandoFormGrupo && (
            <form
              onSubmit={guardarGrupo}
              className="mb-5 space-y-3 rounded-lg border border-line bg-notes p-4"
            >
              <h3 className="text-sm font-bold text-heading">
                {editandoGrupo ? 'Editar grupo muscular' : 'Nuevo grupo muscular'}
              </h3>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  className={inputClass}
                  value={nombreGrupo}
                  onChange={(e) => setNombreGrupo(e.target.value)}
                  placeholder="Nombre del grupo"
                  aria-label="Nombre del grupo"
                  autoFocus
                />
                <button className={`${btnPrimary} shrink-0`} type="submit">
                  <Save className={iconClass} />
                  Guardar
                </button>
                <button className={`${btnSecondary} shrink-0`} type="button" onClick={resetGrupoForm}>
                  <X className={iconClass} />
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {grupos.length === 0 ? (
            <EmptyState title="Sin grupos" message="Agrega el primer grupo muscular." />
          ) : gruposFiltrados.length === 0 ? (
            <EmptyState title="Sin resultados" message="No encontramos grupos con esa búsqueda." />
          ) : (
            <ul className="m-0 list-none p-0">
              {gruposFiltrados.map((grupo) => (
                <li
                  key={grupo.id_grupo_muscular}
                  className="flex items-center justify-between gap-3 border-b border-line py-3 last:border-b-0"
                >
                  <span className="min-w-0 font-semibold break-words text-heading">{grupo.nombre}</span>
                  <span className="flex shrink-0 gap-2">
                    <button
                      className={iconBtnSecondary}
                      type="button"
                      aria-label={`Editar ${grupo.nombre}`}
                      title="Editar"
                      onClick={() => {
                        setEditandoGrupo(grupo.id_grupo_muscular);
                        setNombreGrupo(grupo.nombre);
                        setMostrandoFormGrupo(true);
                      }}
                    >
                      <SquarePen className={iconClass} />
                    </button>
                    <button
                      className={iconBtnDanger}
                      type="button"
                      aria-label={`Eliminar ${grupo.nombre}`}
                      title="Eliminar"
                      onClick={() => {
                        if (!window.confirm(`¿Eliminar el grupo "${grupo.nombre}"?`)) return;
                        void deleteGrupoMuscular(grupo.id_grupo_muscular)
                          .then(recargar)
                          .catch((err) => setFormError(getErrorMessage(err)));
                      }}
                    >
                      <Trash className={iconClass} />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-[10px] border border-line bg-surface p-5">
          <h2 className="mb-4 text-lg font-bold text-heading">Ejercicios</h2>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row">
            <input
              className={inputClass}
              type="search"
              value={busquedaEjercicio}
              onChange={(e) => setBusquedaEjercicio(e.target.value)}
              placeholder="Buscar por nombre o grupo muscular"
              aria-label="Buscar ejercicio"
            />
            <button
              className={`${btnPrimary} shrink-0`}
              type="button"
              onClick={() => {
                resetEjercicioForm();
                setMostrandoFormEjercicio(true);
              }}
            >
              <SquarePlus className={iconClass} />
              Agregar
            </button>
          </div>

          {mostrandoFormEjercicio && (
            <form
              onSubmit={guardarEjercicio}
              className="mb-5 space-y-3 rounded-lg border border-line bg-notes p-4"
            >
              <h3 className="text-sm font-bold text-heading">
                {editandoEjercicio ? 'Editar ejercicio' : 'Nuevo ejercicio'}
              </h3>
              <label className="block">
                <span className={labelClass}>Nombre</span>
                <input
                  className={inputClass}
                  value={nombreEjercicio}
                  onChange={(e) => setNombreEjercicio(e.target.value)}
                  placeholder="Press banca"
                  autoFocus
                />
              </label>
              <label className="block">
                <span className={labelClass}>Descripción</span>
                <textarea
                  className={`${inputClass} min-h-20 resize-y`}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                />
              </label>
              <fieldset>
                <legend className={labelClass}>Grupos musculares</legend>
                <div className="flex flex-wrap gap-2">
                  {grupos.map((grupo) => (
                    <label
                      key={grupo.id_grupo_muscular}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line px-3 py-1 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={gruposEjercicio.includes(grupo.id_grupo_muscular)}
                        onChange={() => toggleGrupoEjercicio(grupo.id_grupo_muscular)}
                      />
                      {grupo.nombre}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="flex flex-wrap gap-2">
                <button className={btnPrimary} type="submit">
                  <Save className={iconClass} />
                  Guardar
                </button>
                <button className={btnSecondary} type="button" onClick={resetEjercicioForm}>
                  <X className={iconClass} />
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {ejercicios.length === 0 ? (
            <EmptyState title="Sin ejercicios" message="Agrega ejercicios para armar rutinas." />
          ) : ejerciciosFiltrados.length === 0 ? (
            <EmptyState title="Sin resultados" message="No encontramos ejercicios con esa búsqueda." />
          ) : (
            <ul className="m-0 list-none p-0">
              {ejerciciosFiltrados.map((ejercicio) => (
                <li key={ejercicio.id_ejercicio} className="border-b border-line py-3 last:border-b-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-heading">{ejercicio.nombre_ejercicio}</p>
                      {ejercicio.descripcion && (
                        <p className="mt-1 text-sm text-muted">{ejercicio.descripcion}</p>
                      )}
                      {ejercicio.grupos_musculares.length > 0 && (
                        <p className="mt-1 text-xs text-muted">
                          {ejercicio.grupos_musculares.map((grupo) => grupo.nombre).join(', ')}
                        </p>
                      )}
                    </div>
                    <span className="flex shrink-0 gap-2">
                      <button
                        className={iconBtnSecondary}
                        type="button"
                        aria-label={`Editar ${ejercicio.nombre_ejercicio}`}
                        title="Editar"
                        onClick={() => {
                          setEditandoEjercicio(ejercicio.id_ejercicio);
                          setMostrandoFormEjercicio(true);
                          setNombreEjercicio(ejercicio.nombre_ejercicio);
                          setDescripcion(ejercicio.descripcion ?? '');
                          setGruposEjercicio(
                            ejercicio.grupos_musculares.map((grupo) => grupo.id_grupo_muscular),
                          );
                        }}
                      >
                        <SquarePen className={iconClass} />
                      </button>
                      <button
                        className={iconBtnDanger}
                        type="button"
                        aria-label={`Eliminar ${ejercicio.nombre_ejercicio}`}
                        title="Eliminar"
                        onClick={() => {
                          if (!window.confirm(`¿Eliminar "${ejercicio.nombre_ejercicio}"?`)) return;
                          void deleteEjercicioCatalogo(ejercicio.id_ejercicio)
                            .then(recargar)
                            .catch((err) => setFormError(getErrorMessage(err)));
                        }}
                      >
                        <Trash className={iconClass} />
                      </button>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
