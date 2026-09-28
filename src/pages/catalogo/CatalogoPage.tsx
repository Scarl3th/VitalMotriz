import { useEffect, useState, type FormEvent } from 'react';
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
import { btnDanger, btnPrimary, btnSecondary, inputClass, labelClass } from '../../components/ui/formStyles';
import { emptyToNull } from '../../lib/format';
import type { EjercicioCatalogo, GrupoMuscular } from '../../types';

export default function CatalogoPage() {
  const [grupos, setGrupos] = useState<GrupoMuscular[]>([]);
  const [ejercicios, setEjercicios] = useState<EjercicioCatalogo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [nombreGrupo, setNombreGrupo] = useState('');
  const [editandoGrupo, setEditandoGrupo] = useState<number | null>(null);

  const [nombreEjercicio, setNombreEjercicio] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [gruposEjercicio, setGruposEjercicio] = useState<number[]>([]);
  const [editandoEjercicio, setEditandoEjercicio] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

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
      setNombreGrupo('');
      setEditandoGrupo(null);
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
          <form onSubmit={guardarGrupo} className="mb-4 flex flex-col gap-2 sm:flex-row">
            <input
              className={inputClass}
              value={nombreGrupo}
              onChange={(e) => setNombreGrupo(e.target.value)}
              placeholder="Nombre del grupo"
            />
            <button className={`${btnPrimary} shrink-0`} type="submit">
              {editandoGrupo ? 'Actualizar' : 'Agregar'}
            </button>
            {editandoGrupo && (
              <button
                className={btnSecondary}
                type="button"
                onClick={() => {
                  setEditandoGrupo(null);
                  setNombreGrupo('');
                }}
              >
                Cancelar
              </button>
            )}
          </form>

          {grupos.length === 0 ? (
            <EmptyState title="Sin grupos" message="Agrega el primer grupo muscular." />
          ) : (
            <ul className="m-0 list-none p-0">
              {grupos.map((grupo) => (
                <li
                  key={grupo.id_grupo_muscular}
                  className="flex flex-col gap-3 border-b border-line py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="font-semibold text-heading">{grupo.nombre}</span>
                  <span className="flex flex-wrap gap-2">
                    <button
                      className={btnSecondary}
                      type="button"
                      onClick={() => {
                        setEditandoGrupo(grupo.id_grupo_muscular);
                        setNombreGrupo(grupo.nombre);
                      }}
                    >
                      Editar
                    </button>
                    <button
                      className={btnDanger}
                      type="button"
                      onClick={() => {
                        if (!window.confirm(`¿Eliminar el grupo "${grupo.nombre}"?`)) return;
                        void deleteGrupoMuscular(grupo.id_grupo_muscular)
                          .then(recargar)
                          .catch((err) => setFormError(getErrorMessage(err)));
                      }}
                    >
                      Eliminar
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-[10px] border border-line bg-surface p-5">
          <h2 className="mb-4 text-lg font-bold text-heading">Ejercicios</h2>
          <form onSubmit={guardarEjercicio} className="mb-5 space-y-3">
            <label className="block">
              <span className={labelClass}>Nombre</span>
              <input
                className={inputClass}
                value={nombreEjercicio}
                onChange={(e) => setNombreEjercicio(e.target.value)}
                placeholder="Press banca"
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
                {editandoEjercicio ? 'Actualizar' : 'Agregar'}
              </button>
              {editandoEjercicio && (
                <button className={btnSecondary} type="button" onClick={resetEjercicioForm}>
                  Cancelar
                </button>
              )}
            </div>
          </form>

          {ejercicios.length === 0 ? (
            <EmptyState title="Sin ejercicios" message="Agrega ejercicios para armar rutinas." />
          ) : (
            <ul className="m-0 list-none p-0">
              {ejercicios.map((ejercicio) => (
                <li key={ejercicio.id_ejercicio} className="border-b border-line py-3 last:border-b-0">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
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
                    <span className="flex shrink-0 flex-wrap gap-2">
                      <button
                        className={btnSecondary}
                        type="button"
                        onClick={() => {
                          setEditandoEjercicio(ejercicio.id_ejercicio);
                          setNombreEjercicio(ejercicio.nombre_ejercicio);
                          setDescripcion(ejercicio.descripcion ?? '');
                          setGruposEjercicio(
                            ejercicio.grupos_musculares.map((grupo) => grupo.id_grupo_muscular),
                          );
                        }}
                      >
                        Editar
                      </button>
                      <button
                        className={btnDanger}
                        type="button"
                        onClick={() => {
                          if (!window.confirm(`¿Eliminar "${ejercicio.nombre_ejercicio}"?`)) return;
                          void deleteEjercicioCatalogo(ejercicio.id_ejercicio)
                            .then(recargar)
                            .catch((err) => setFormError(getErrorMessage(err)));
                        }}
                      >
                        Eliminar
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
