import { useNavigate } from 'react-router-dom';
import { clienteNombreCompleto, formatDate } from '../../lib/format';
import type { Cliente } from '../../types';

interface ClienteListProps {
  clientes: Cliente[];
}

export default function ClienteList({ clientes }: ClienteListProps) {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto rounded-[10px] border border-line bg-surface">
      <table className="w-full min-w-[36rem] border-collapse text-left">
        <thead>
          <tr>
            <th className="border-b border-line bg-thead px-4 py-3 text-[13px] font-bold uppercase tracking-wider text-neon">
              Nombre
            </th>
            <th className="border-b border-line bg-thead px-4 py-3 text-[13px] font-bold uppercase tracking-wider text-neon">
              Teléfono
            </th>
            <th className="border-b border-line bg-thead px-4 py-3 text-[13px] font-bold uppercase tracking-wider text-neon">
              Fecha de registro
            </th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente) => (
            <tr
              key={cliente.id_cliente}
              className="cursor-pointer hover:bg-surface-hover"
              onClick={() => navigate(`/clientes/${cliente.id_cliente}`)}
            >
              <td className="border-b border-line px-4 py-3.5 font-semibold text-heading">
                {clienteNombreCompleto(cliente.nombre, cliente.apellido)}
              </td>
              <td className="border-b border-line px-4 py-3.5 text-ink">
                {cliente.telefono || '—'}
              </td>
              <td className="border-b border-line px-4 py-3.5 text-ink">
                {formatDate(cliente.fecha_registro)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
