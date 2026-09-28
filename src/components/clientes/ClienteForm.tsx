import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { btnPrimary, btnSecondary, inputClass, labelClass } from '../ui/formStyles';
import { emptyToNull, toDateInput } from '../../lib/format';
import type { Cliente } from '../../types';

interface ClienteFormProps {
  cliente?: Cliente;
  cancelTo: string;
  onSubmit: (input: {
    nombre: string;
    apellido: string | null;
    email: string | null;
    telefono: string | null;
    fecha_nacimiento: string | null;
  }) => Promise<void>;
}

export default function ClienteForm({ cliente, cancelTo, onSubmit }: ClienteFormProps) {
  const [nombre, setNombre] = useState(cliente?.nombre ?? '');
  const [apellido, setApellido] = useState(cliente?.apellido ?? '');
  const [email, setEmail] = useState(cliente?.email ?? '');
  const [telefono, setTelefono] = useState(cliente?.telefono ?? '');
  const [fechaNacimiento, setFechaNacimiento] = useState(toDateInput(cliente?.fecha_nacimiento));
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!nombre.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }

    try {
      setGuardando(true);
      setError(null);
      await onSubmit({
        nombre: nombre.trim(),
        apellido: emptyToNull(apellido),
        email: emptyToNull(email),
        telefono: emptyToNull(telefono),
        fecha_nacimiento: emptyToNull(fechaNacimiento),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el cliente.');
      setGuardando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl rounded-[10px] border border-line bg-surface p-4 sm:p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label>
          <span className={labelClass}>Nombre</span>
          <input className={inputClass} value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </label>
        <label>
          <span className={labelClass}>Apellido</span>
          <input className={inputClass} value={apellido} onChange={(e) => setApellido(e.target.value)} />
        </label>
        <label>
          <span className={labelClass}>Email</span>
          <input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          <span className={labelClass}>Teléfono</span>
          <input className={inputClass} value={telefono} onChange={(e) => setTelefono(e.target.value)} />
        </label>
        <label className="sm:col-span-2">
          <span className={labelClass}>Fecha de nacimiento</span>
          <input
            className={inputClass}
            type="date"
            value={fechaNacimiento}
            onChange={(e) => setFechaNacimiento(e.target.value)}
          />
        </label>
      </div>

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
