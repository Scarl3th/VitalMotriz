import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { btnPrimary, btnSecondary, inputClass, labelClass } from '../ui/formStyles';
import { emptyToNull, parseOptionalNumber, toDateInput } from '../../lib/format';
import type { EvaluacionFisica, EvaluacionInput } from '../../types';

interface EvaluacionFormProps {
  idCliente: number;
  evaluacion?: EvaluacionFisica;
  cancelTo: string;
  onSubmit: (input: EvaluacionInput) => Promise<void>;
}

export default function EvaluacionForm({
  idCliente,
  evaluacion,
  cancelTo,
  onSubmit,
}: EvaluacionFormProps) {
  const [fecha, setFecha] = useState(toDateInput(evaluacion?.fecha_evaluacion) || new Date().toISOString().slice(0, 10));
  const [peso, setPeso] = useState(evaluacion?.peso_kg?.toString() ?? '');
  const [altura, setAltura] = useState(evaluacion?.altura_cm?.toString() ?? '');
  const [brazoContraido, setBrazoContraido] = useState(evaluacion?.brazo_contraido_cm?.toString() ?? '');
  const [brazoRelajado, setBrazoRelajado] = useState(evaluacion?.brazo_relajado_cm?.toString() ?? '');
  const [cintura, setCintura] = useState(evaluacion?.cintura_cm?.toString() ?? '');
  const [muslo, setMuslo] = useState(evaluacion?.muslo_medio_cm?.toString() ?? '');
  const [pantorrilla, setPantorrilla] = useState(evaluacion?.pantorrilla_cm?.toString() ?? '');
  const [objetivo, setObjetivo] = useState(evaluacion?.objetivo ?? '');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!fecha) {
      setError('La fecha es obligatoria.');
      return;
    }

    try {
      setGuardando(true);
      setError(null);
      await onSubmit({
        id_cliente: idCliente,
        fecha_evaluacion: fecha,
        peso_kg: parseOptionalNumber(peso),
        altura_cm: parseOptionalNumber(altura),
        brazo_contraido_cm: parseOptionalNumber(brazoContraido),
        brazo_relajado_cm: parseOptionalNumber(brazoRelajado),
        cintura_cm: parseOptionalNumber(cintura),
        muslo_medio_cm: parseOptionalNumber(muslo),
        pantorrilla_cm: parseOptionalNumber(pantorrilla),
        objetivo: emptyToNull(objetivo),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la evaluación.');
      setGuardando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-[10px] border border-line bg-surface p-4 sm:p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label>
          <span className={labelClass}>Fecha</span>
          <input className={inputClass} type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
        </label>
        <label>
          <span className={labelClass}>Peso (kg)</span>
          <input className={inputClass} inputMode="decimal" value={peso} onChange={(e) => setPeso(e.target.value)} />
        </label>
        <label>
          <span className={labelClass}>Altura (cm)</span>
          <input className={inputClass} inputMode="decimal" value={altura} onChange={(e) => setAltura(e.target.value)} />
        </label>
      </div>

      <h2 className="mb-3 mt-8 text-[13px] font-bold uppercase tracking-wider text-neon">Perímetros (cm)</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label>
          <span className={labelClass}>Brazo contraído</span>
          <input className={inputClass} inputMode="decimal" value={brazoContraido} onChange={(e) => setBrazoContraido(e.target.value)} />
        </label>
        <label>
          <span className={labelClass}>Brazo relajado</span>
          <input className={inputClass} inputMode="decimal" value={brazoRelajado} onChange={(e) => setBrazoRelajado(e.target.value)} />
        </label>
        <label>
          <span className={labelClass}>Cintura</span>
          <input className={inputClass} inputMode="decimal" value={cintura} onChange={(e) => setCintura(e.target.value)} />
        </label>
        <label>
          <span className={labelClass}>Muslo medio</span>
          <input className={inputClass} inputMode="decimal" value={muslo} onChange={(e) => setMuslo(e.target.value)} />
        </label>
        <label>
          <span className={labelClass}>Pantorrilla</span>
          <input className={inputClass} inputMode="decimal" value={pantorrilla} onChange={(e) => setPantorrilla(e.target.value)} />
        </label>
      </div>

      <label className="mt-6 block">
        <span className={labelClass}>Objetivo</span>
        <textarea
          className={`${inputClass} min-h-24 resize-y`}
          value={objetivo}
          onChange={(e) => setObjetivo(e.target.value)}
        />
      </label>

      {error && <p className="mt-4 text-sm text-danger">{error}</p>}

      <div className="mt-6 flex flex-wrap gap-3">
        <button className={btnPrimary} type="submit" disabled={guardando}>
          {guardando ? 'Guardando...' : 'Guardar'}
        </button>
        <Link className={btnSecondary} to={cancelTo}>
          Cancelar
        </Link>
      </div>
    </form>
  );
}
