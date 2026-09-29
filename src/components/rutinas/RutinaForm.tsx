import { useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Save, SquarePlus, Trash, X } from 'lucide-react';
import { btnDanger, btnDangerSolid, btnPrimary, btnSecondary, iconClass, inputClass, labelClass } from '../ui/formStyles';
import Select, { type SelectOption } from '../ui/Select';
import { emptyToNull, parseOptionalNumber, toDateInput } from '../../lib/format';
import type {
  EjercicioCatalogo,
  GrupoMuscular,
  Rutina,
  RutinaDraft,
  TipoSeccion,
} from '../../types';

interface DiaLocal {
  key: string;
  nombre_dia: string;
  notas: string;
  id_grupos: number[];
  ejercicios: EjercicioLocal[];
}

interface EjercicioLocal {
  key: string;
  id_ejercicio: number;
  tipo_seccion: TipoSeccion;
  series: string;
  repeticiones: string;
  duracion_segundos: string;
  porcentaje_intensidad: string;
}

interface RutinaFormProps {
  idCliente: number;
  rutina?: Rutina;
  grupos: GrupoMuscular[];
  ejerciciosCatalogo: EjercicioCatalogo[];
  cancelTo: string;
  onSubmit: (draft: RutinaDraft) => Promise<void>;
}

const opcionesSeccion: SelectOption<TipoSeccion>[] = [
  { value: 'calentamiento', label: 'Calentamiento' },
  { value: 'principal', label: 'Principal' },
];

function newKey(): string {
  return crypto.randomUUID();
}

function emptyDia(orden: number): DiaLocal {
  return {
    key: newKey(),
    nombre_dia: `Día ${orden}`,
    notas: '',
    id_grupos: [],
    ejercicios: [],
  };
}

function emptyEjercicio(idEjercicio: number): EjercicioLocal {
  return {
    key: newKey(),
    id_ejercicio: idEjercicio,
    tipo_seccion: 'principal',
    series: '',
    repeticiones: '',
    duracion_segundos: '',
    porcentaje_intensidad: '',
  };
}

export default function RutinaForm({
  idCliente,
  rutina,
  grupos,
  ejerciciosCatalogo,
  cancelTo,
  onSubmit,
}: RutinaFormProps) {
  const [nombre, setNombre] = useState(rutina?.nombre_rutina ?? '');
  const [fechaInicio, setFechaInicio] = useState(toDateInput(rutina?.fecha_inicio));
  const [fechaFin, setFechaFin] = useState(toDateInput(rutina?.fecha_fin));
  const [dias, setDias] = useState<DiaLocal[]>(() => {
    if (!rutina?.dias_rutina.length) return [emptyDia(1)];
    return rutina.dias_rutina.map((dia) => ({
      key: newKey(),
      nombre_dia: dia.nombre_dia,
      notas: dia.notas ?? '',
      id_grupos: dia.grupos_musculares.map((grupo) => grupo.id_grupo_muscular),
      ejercicios: dia.ejercicios_rutina.map((ejercicio) => ({
        key: newKey(),
        id_ejercicio: ejercicio.ejercicios?.id_ejercicio ?? 0,
        tipo_seccion: ejercicio.tipo_seccion,
        series: ejercicio.series?.toString() ?? '',
        repeticiones: ejercicio.repeticiones?.toString() ?? '',
        duracion_segundos: ejercicio.duracion_segundos?.toString() ?? '',
        porcentaje_intensidad: ejercicio.porcentaje_intensidad?.toString() ?? '',
      })),
    }));
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ejercicioPendiente, setEjercicioPendiente] = useState<Record<string, number>>({});

  const primerEjercicioId = ejerciciosCatalogo[0]?.id_ejercicio ?? 0;
  const catalogoPorId = useMemo(
    () => new Map(ejerciciosCatalogo.map((item) => [item.id_ejercicio, item])),
    [ejerciciosCatalogo],
  );
  const opcionesEjercicios = useMemo<SelectOption<number>[]>(
    () =>
      ejerciciosCatalogo.map((item) => ({ value: item.id_ejercicio, label: item.nombre_ejercicio })),
    [ejerciciosCatalogo],
  );

  const updateDia = (key: string, patch: Partial<DiaLocal>) => {
    setDias((actual) => actual.map((dia) => (dia.key === key ? { ...dia, ...patch } : dia)));
  };

  const updateEjercicio = (diaKey: string, ejercicioKey: string, patch: Partial<EjercicioLocal>) => {
    setDias((actual) =>
      actual.map((dia) =>
        dia.key !== diaKey
          ? dia
          : {
              ...dia,
              ejercicios: dia.ejercicios.map((ejercicio) =>
                ejercicio.key === ejercicioKey ? { ...ejercicio, ...patch } : ejercicio,
              ),
            },
      ),
    );
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (dias.some((dia) => !dia.nombre_dia.trim())) {
      setError('Cada día necesita un nombre.');
      return;
    }
    if (dias.some((dia) => dia.ejercicios.some((ejercicio) => !ejercicio.id_ejercicio))) {
      setError('Todos los ejercicios tienen que estar elegidos del catálogo.');
      return;
    }

    try {
      setGuardando(true);
      setError(null);
      await onSubmit({
        id_cliente: idCliente,
        nombre_rutina: emptyToNull(nombre),
        fecha_inicio: emptyToNull(fechaInicio),
        fecha_fin: emptyToNull(fechaFin),
        dias: dias.map((dia, index) => ({
          nombre_dia: dia.nombre_dia.trim(),
          orden_dia: index + 1,
          notas: emptyToNull(dia.notas),
          id_grupos: dia.id_grupos,
          ejercicios: dia.ejercicios.map((ejercicio, orden) => ({
            id_ejercicio: ejercicio.id_ejercicio,
            tipo_seccion: ejercicio.tipo_seccion,
            series: parseOptionalNumber(ejercicio.series),
            repeticiones: parseOptionalNumber(ejercicio.repeticiones),
            duracion_segundos: parseOptionalNumber(ejercicio.duracion_segundos),
            porcentaje_intensidad: parseOptionalNumber(ejercicio.porcentaje_intensidad),
            orden_ejercicio: orden + 1,
          })),
        })),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la rutina.');
      setGuardando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-[10px] border border-line bg-surface p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className={labelClass}>Nombre de la rutina</span>
            <input className={inputClass} value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </label>
          <label>
            <span className={labelClass}>Fecha de inicio</span>
            <input className={inputClass} type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
          </label>
          <label>
            <span className={labelClass}>Fecha de fin</span>
            <input className={inputClass} type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
          </label>
        </div>
      </div>
      <div>
        <span className="min-w-0 font-display text-2xl font-extrabold break-words text-heading">Días</span>
      </div>
      {dias.map((dia) => (
        <section key={dia.key} className="overflow-hidden rounded-[10px] border border-line bg-surface">
          <div className="flex flex-col gap-3 border-b border-line bg-surface-hover px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <label className="flex w-full items-center gap-3 sm:max-w-md">
              <span className={`${labelClass} mb-0! shrink-0`}>Título</span>
              <input
                className={inputClass}
                value={dia.nombre_dia}
                onChange={(e) => updateDia(dia.key, { nombre_dia: e.target.value })}
              />
            </label>
            {dias.length > 1 && (
              <button
                className={btnDangerSolid}
                type="button"
                onClick={() => setDias((actual) => actual.filter((item) => item.key !== dia.key))}
              >
                <Trash className={iconClass} />
                Quitar día
              </button>
            )}
          </div>

          <div className="space-y-4 px-4 py-5 sm:px-6">
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
                      checked={dia.id_grupos.includes(grupo.id_grupo_muscular)}
                      onChange={() => {
                        const next = dia.id_grupos.includes(grupo.id_grupo_muscular)
                          ? dia.id_grupos.filter((id) => id !== grupo.id_grupo_muscular)
                          : [...dia.id_grupos, grupo.id_grupo_muscular];
                        updateDia(dia.key, { id_grupos: next });
                      }}
                    />
                    {grupo.nombre}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Select
                className="sm:w-4/5"
                searchable
                value={ejercicioPendiente[dia.key] ?? primerEjercicioId}
                onChange={(idEjercicio) =>
                  setEjercicioPendiente((actual) => ({ ...actual, [dia.key]: idEjercicio }))
                }
                options={opcionesEjercicios}
                placeholder="Buscar ejercicio"
                aria-label="Ejercicio a agregar"
                disabled={ejerciciosCatalogo.length === 0}
              />
              <button
                className={`${btnPrimary} shrink-0 whitespace-nowrap sm:flex-1`}
                type="button"
                disabled={ejerciciosCatalogo.length === 0}
                onClick={() => {
                  const idEjercicio = ejercicioPendiente[dia.key] ?? primerEjercicioId;
                  if (!idEjercicio) return;
                  updateDia(dia.key, {
                    ejercicios: [...dia.ejercicios, emptyEjercicio(idEjercicio)],
                  });
                }}
              >
                <SquarePlus className={iconClass} />
                Agregar ejercicio
              </button>
            </div>
            {ejerciciosCatalogo.length === 0 && (
              <p className="text-sm text-muted">
                No hay ejercicios en el catálogo.{' '}
                <Link className="text-neon" to="/catalogo">
                  Cargar catálogo
                </Link>
              </p>
            )}

            {dia.ejercicios.map((ejercicio) => (
              <div key={ejercicio.key} className="grid grid-cols-1 gap-3 rounded-lg border border-line p-3 sm:grid-cols-2 xl:grid-cols-6">
                <div className="sm:col-span-2">
                  <span className={labelClass}>Ejercicio</span>
                  <Select
                    searchable
                    value={ejercicio.id_ejercicio}
                    onChange={(idEjercicio) =>
                      updateEjercicio(dia.key, ejercicio.key, { id_ejercicio: idEjercicio })
                    }
                    options={
                      !catalogoPorId.has(ejercicio.id_ejercicio) && ejercicio.id_ejercicio > 0
                        ? [
                            ...opcionesEjercicios,
                            {
                              value: ejercicio.id_ejercicio,
                              label: `Ejercicio #${ejercicio.id_ejercicio}`,
                            },
                          ]
                        : opcionesEjercicios
                    }
                    aria-label="Ejercicio"
                  />
                </div>
                <div>
                  <span className={labelClass}>Sección</span>
                  <Select
                    value={ejercicio.tipo_seccion}
                    onChange={(tipoSeccion) =>
                      updateEjercicio(dia.key, ejercicio.key, { tipo_seccion: tipoSeccion })
                    }
                    options={opcionesSeccion}
                    aria-label="Sección"
                  />
                </div>
                <label>
                  <span className={labelClass}>Series</span>
                  <input
                    className={inputClass}
                    inputMode="numeric"
                    value={ejercicio.series}
                    onChange={(e) => updateEjercicio(dia.key, ejercicio.key, { series: e.target.value })}
                  />
                </label>
                <label>
                  <span className={labelClass}>Reps</span>
                  <input
                    className={inputClass}
                    inputMode="numeric"
                    value={ejercicio.repeticiones}
                    onChange={(e) =>
                      updateEjercicio(dia.key, ejercicio.key, { repeticiones: e.target.value })
                    }
                  />
                </label>
                <label>
                  <span className={labelClass}>Duración (seg)</span>
                  <input
                    className={inputClass}
                    inputMode="numeric"
                    value={ejercicio.duracion_segundos}
                    onChange={(e) =>
                      updateEjercicio(dia.key, ejercicio.key, { duracion_segundos: e.target.value })
                    }
                  />
                </label>
                <label>
                  <span className={labelClass}>Intensidad %</span>
                  <input
                    className={inputClass}
                    inputMode="numeric"
                    value={ejercicio.porcentaje_intensidad}
                    onChange={(e) =>
                      updateEjercicio(dia.key, ejercicio.key, {
                        porcentaje_intensidad: e.target.value,
                      })
                    }
                  />
                </label>
                <div className="flex justify-end sm:col-span-2 xl:col-span-6">
                  <button
                    className={btnDanger}
                    type="button"
                    onClick={() =>
                      updateDia(dia.key, {
                        ejercicios: dia.ejercicios.filter((item) => item.key !== ejercicio.key),
                      })
                    }
                  >
                    <Trash className={iconClass} />
                    Quitar ejercicio
                  </button>
                </div>
              </div>
            ))}

            <label className="block">
              <span className={labelClass}>Notas del día</span>
              <textarea
                className={`${inputClass} min-h-20 resize-y`}
                value={dia.notas}
                onChange={(e) => updateDia(dia.key, { notas: e.target.value })}
              />
            </label>
          </div>
        </section>
      ))}

      <button
        className={`${btnPrimary} w-full`}
        type="button"
        onClick={() => setDias((actual) => [...actual, emptyDia(actual.length + 1)])}
      >
        <SquarePlus className={iconClass} />
        Agregar día
      </button>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex flex-wrap justify-end gap-3">
        <button className={btnPrimary} type="submit" disabled={guardando}>
          <Save className={iconClass} />
          {guardando ? 'Guardando...' : 'Guardar rutina'}
        </button>
        <Link className={btnSecondary} to={cancelTo}>
          <X className={iconClass} />
          Cancelar
        </Link>
      </div>
    </form>
  );
}
