import { Link, useNavigate } from 'react-router-dom';
import { createCliente } from '../../api/clientes';
import ClienteForm from '../../components/clientes/ClienteForm';

export default function ClienteNuevoPage() {
  const navigate = useNavigate();

  return (
    <section>
      <Link to="/clientes" className="mb-4 inline-block text-sm text-muted no-underline hover:text-neon">
        ← Volver a clientes
      </Link>
      <h1 className="mb-6 text-[28px] font-extrabold text-heading">Nuevo cliente</h1>
      <ClienteForm
        cancelTo="/clientes"
        onSubmit={async (input) => {
          const creado = await createCliente(input);
          navigate(`/clientes/${creado.id_cliente}`);
        }}
      />
    </section>
  );
}
