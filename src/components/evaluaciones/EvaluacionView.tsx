import { formatDateLong, formatNumber } from '../../lib/format';
import type { EvaluacionFisica } from '../../types';

interface EvaluacionViewProps {
  nombreCliente: string;
  evaluacion: EvaluacionFisica;
}

function cm(value: number | null): string {
  if (value === null) return '—';
  return `${formatNumber(value)} cm`;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="m-0 text-[15px] font-semibold text-heading">{value}</dd>
    </div>
  );
}

export default function EvaluacionView({ nombreCliente, evaluacion }: EvaluacionViewProps) {
  return (
    <article>
      <header className="mb-6">
        <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-neon">
          Evaluación física
        </p>
        <h2 className="mt-1.5 text-2xl font-extrabold break-words text-heading sm:text-[28px]">{nombreCliente}</h2>
      </header>

      <div className="overflow-hidden rounded-[10px] border border-line bg-surface">
        <section className="px-4 py-5 sm:px-6">
          <h3 className="mb-3 text-[13px] font-bold uppercase tracking-wider text-neon">
            Datos generales
          </h3>
          <dl className="m-0 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Fecha" value={formatDateLong(evaluacion.fecha_evaluacion)} />
            <Field
              label="Peso"
              value={evaluacion.peso_kg != null ? `${formatNumber(evaluacion.peso_kg)} kg` : '—'}
            />
            <Field label="Altura" value={cm(evaluacion.altura_cm)} />
          </dl>
        </section>

        <section className="border-t border-line px-4 py-5 sm:px-6">
          <h3 className="mb-3 text-[13px] font-bold uppercase tracking-wider text-neon">
            Perímetros
          </h3>
          <dl className="m-0 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            <Field label="Brazo contraído" value={cm(evaluacion.brazo_contraido_cm)} />
            <Field label="Brazo relajado" value={cm(evaluacion.brazo_relajado_cm)} />
            <Field label="Cintura" value={cm(evaluacion.cintura_cm)} />
            <Field label="Muslo medio" value={cm(evaluacion.muslo_medio_cm)} />
            <Field label="Pantorrilla" value={cm(evaluacion.pantorrilla_cm)} />
          </dl>
        </section>

        <section className="border-t border-line bg-notes px-4 py-5 sm:px-6">
          <h3 className="mb-3 text-[13px] font-bold uppercase tracking-wider text-neon">
            Objetivo
          </h3>
          <p className="m-0 text-[15px] leading-relaxed text-heading">
            {evaluacion.objetivo || '—'}
          </p>
        </section>
      </div>
    </article>
  );
}
