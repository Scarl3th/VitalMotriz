import type { ReactNode } from 'react';
import { grupoMuscularTone } from '../../lib/grupoMuscularColor';
import { cn } from '../../lib/cn';
import { formatDate } from '../../lib/format';
import type { Rutina } from '../../types';

interface RutinaViewProps {
  rutina: Rutina;
  actions?: ReactNode;
}

const edgeCell = 'px-3 first:pl-4 last:pr-4 sm:first:pl-6 sm:last:pr-6';
const thClass = cn(
  edgeCell,
  'border-b border-line py-2.5 text-[13px] font-bold uppercase tracking-wider text-muted',
);
const tdClass = cn(edgeCell, 'border-b border-surface-hover py-3 align-top tabular-nums');

export default function RutinaView({ rutina, actions }: RutinaViewProps) {
  return (
    <article>
      <header className="mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="min-w-0 text-2xl font-extrabold break-words text-heading">
            {rutina.nombre_rutina || 'Rutina sin nombre'}
          </h2>
          {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-3 text-sm text-muted">
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

              <div className="overflow-x-auto">
              <table className="w-full min-w-[40rem] border-collapse text-left">
                <thead>
                  <tr>
                    <th className={thClass}>Sección</th>
                    <th className={thClass}>Ejercicio</th>
                    <th className={thClass}>Series</th>
                    <th className={thClass}>Repeticiones</th>
                    <th className={thClass}>Duración</th>
                    <th className={thClass}>Intensidad</th>
                  </tr>
                </thead>
                <tbody>
                  {dia.ejercicios_rutina.map((ejercicio) => (
                    <tr key={ejercicio.id_detalle} className="last:*:border-b-0">
                      <td className={cn(tdClass, 'text-ink')}>
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
                      <td className={cn(tdClass, 'font-semibold text-heading')}>
                        {ejercicio.ejercicios?.nombre_ejercicio || 'Ejercicio'}
                      </td>
                      <td className={cn(tdClass, 'font-bold text-neon')}>
                        {ejercicio.series ?? '—'}
                      </td>
                      <td className={cn(tdClass, 'text-ink')}>
                        {ejercicio.repeticiones ?? '—'}
                      </td>
                      <td className={cn(tdClass, 'text-ink')}>
                        {ejercicio.duracion_segundos != null
                          ? `${ejercicio.duracion_segundos} seg`
                          : '—'}
                      </td>
                      <td className={cn(tdClass, 'font-bold text-neon')}>
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
