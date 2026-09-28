export interface Cliente {
  id_cliente: number;
  nombre: string;
  apellido: string | null;
  email: string | null;
  telefono: string | null;
  fecha_nacimiento: string | null;
  fecha_registro: string | null;
}

export interface ClienteInput {
  nombre: string;
  apellido: string | null;
  email: string | null;
  telefono: string | null;
  fecha_nacimiento: string | null;
}
