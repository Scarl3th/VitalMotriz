import { grupoMuscularTone } from '../../lib/grupoMuscularColor';
import { cn } from '../../lib/cn';
import { formatDate, formatEstado } from '../../lib/format';
import type { EstadoRutina, Rutina } from '../../types';

interface RutinaViewProps {
  rutina: Rutina;
}

function badgeClass(estado: EstadoRutina): string {
  const base =
    'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider';
  if (estado === 'activa') return cn(base, 'border-neon-border bg-neon-dim text-neon');
  if (estado === 'completada') return cn(base, 'border-warn-border bg-warn-dim text-warn');
  return cn(base, 'border-line bg-surface-hover text-muted');
}

export default function RutinaView({ rutina }: RutinaViewProps) {
  return (
    <article>
      <header className="mb-6">
        <h2 className="text-2xl font-extrabold text-heading">
          {rutina.nombre_rutina || 'Rutina sin nombre'}
        </h2>
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-3 text-sm text-muted">
          <span className={badgeClass(rutina.estado)}>{formatEstado(rutina.estado)}</span>
          <span>Inicio: {formatDate(rutina.fecha_inicio)}</span>
          <span>Fin: {formatDate(rutina.fecha_fin)}</span>
        </div>
      </header>

      {rutina.dias_rutina.length === 0 ? (
        <p className="text-sm text-muted">Esta rutina todavía no tiene días cargados.</p>
      ) : (
        <div className="flex flex-col gap-5">
          {rutina.dias_rutina.map((dia) => (
            <section
              key={dia.id_dia_rutina}
              className="overflow-hidden rounded-[10px] border border-line bg-surface"
            >
              <div className="flex flex-col gap-3 border-b border-line bg-notes px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <h3 className="text-lg font-bold text-neon">{dia.nombre_dia}</h3>
                {dia.grupos_musculares.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 sm:justify-end">
                    {dia.grupos_musculares.map((grupo) => {
                      const tone = grupoMuscularTone(grupo.nombre);
                      return (
                        <span
                          key={grupo.id_grupo_muscular}
                          className="rounded-full border px-2.5 py-0.5 text-xs font-bold tracking-wide"
                          style={{
                            color: tone.color,
                            backgroundColor: tone.bg,
                            borderColor: tone.border,
                          }}
                        >
                          {grupo.nombre}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="overflow-x-auto px-4 sm:px-6">
              <table className="w-full min-w-[40rem] border-collapse text-left">
                <thead>
                  <tr>
                    <th className="border-b border-line px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-muted">
                      Sección
                    </th>
                    <th className="border-b border-line px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-muted">
                      Ejercicio
                    </th>
                    <th className="border-b border-line px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-muted">
                      Series
                    </th>
                    <th className="border-b border-line px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-muted">
                      Repeticiones
                    </th>
                    <th className="border-b border-line px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-muted">
                      Duración
                    </th>
                    <th className="border-b border-line px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-muted">
                      Intensidad
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dia.ejercicios_rutina.map((ejercicio) => (
                    <tr key={ejercicio.id_detalle}>
                      <td className="border-b border-surface-hover px-3 py-3 align-top text-ink">
                        <span
                          className={cn(
                            'inline-block rounded px-1.5 py-0.5 text-[10px] font-extrabold tracking-wider',
                            ejercicio.tipo_seccion === 'calentamiento'
                              ? 'border border-warn-border bg-warn-dim text-warn'
                              : 'border border-neon-border bg-neon-dim text-neon',
                          )}
                        >
                          {ejercicio.tipo_seccion === 'calentamiento'
                            ? 'Calentamiento'
                            : 'Principal'}
                        </span>
                      </td>
                      <td className="border-b border-surface-hover px-3 py-3 align-top font-semibold text-heading">
                        {ejercicio.ejercicios?.nombre_ejercicio || 'Ejercicio'}
                      </td>
                      <td className="border-b border-surface-hover px-3 py-3 align-top font-bold text-neon">
                        {ejercicio.series ?? '—'}
                      </td>
                      <td className="border-b border-surface-hover px-3 py-3 align-top text-ink">
                        {ejercicio.repeticiones ?? '—'}
                      </td>
                      <td className="border-b border-surface-hover px-3 py-3 align-top text-ink">
                        {ejercicio.duracion_segundos != null
                          ? `${ejercicio.duracion_segundos} seg`
                          : '—'}
                      </td>
                      <td className="border-b border-surface-hover px-3 py-3 align-top font-bold text-neon">
                        {ejercicio.porcentaje_intensidad != null
                          ? `${ejercicio.porcentaje_intensidad}%`
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
              {dia.notas && (
                <div className="border-t border-line bg-notes px-4 py-3.5 text-sm text-ink sm:px-6">
                  <p>{dia.notas}</p>
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </article>
  );
}
