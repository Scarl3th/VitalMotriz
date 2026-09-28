import { useNavigate } from 'react-router-dom';
import { formatDateLong, formatNumber } from '../../lib/format';
import type { EvaluacionFisica } from '../../types';

interface EvaluacionesListProps {
  idCliente: number;
  evaluaciones: EvaluacionFisica[];
}

export default function EvaluacionesList({ idCliente, evaluaciones }: EvaluacionesListProps) {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto rounded-[10px] border border-line bg-surface">
      <table className="w-full min-w-[36rem] border-collapse text-left">
        <thead>
          <tr>
            <th className="border-b border-line bg-thead px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-muted">
              Fecha
            </th>
            <th className="border-b border-line bg-thead px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-muted">
              Peso (kg)
            </th>
            <th className="border-b border-line bg-thead px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-muted">
              Objetivo
            </th>
          </tr>
        </thead>
        <tbody>
          {evaluaciones.map((evaluacion) => (
            <tr
              key={evaluacion.id_evaluacion}
              className="cursor-pointer hover:bg-surface-hover"
              onClick={() =>
                navigate(`/clientes/${idCliente}/evaluaciones/${evaluacion.id_evaluacion}`)
              }
            >
              <td className="whitespace-nowrap border-b border-line px-4 py-3.5 font-semibold text-neon">
                {formatDateLong(evaluacion.fecha_evaluacion)}
              </td>
              <td className="border-b border-line px-4 py-3.5 text-ink">
                {formatNumber(evaluacion.peso_kg)}
              </td>
              <td className="max-w-[520px] truncate border-b border-line px-4 py-3.5 text-ink">
                {evaluacion.objetivo || '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
